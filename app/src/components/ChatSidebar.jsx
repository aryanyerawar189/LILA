import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, CircularProgress, Avatar, Collapse, Tooltip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';

const API_KEY = 'AIzaSyDfQkZDL62hk4yq-2s2LeJth5_1ncM_B_U';

async function queryIndexInfo() {
  try {
    const res = await fetch('/data/index.json');
    if (!res.ok) return { error: "Index not found." };
    const data = await res.json();
    return {
      available_maps: data.maps,
      available_dates: data.dates,
      total_matches: Object.keys(data.matches || {}).length
    };
  } catch (err) {
    return { error: err.message };
  }
}

async function queryTelemetryData(mapName, date) {
  try {
    const res = await fetch(`/data/${mapName}_${date}.json`);
    if (!res.ok) return { error: `No telemetry found for map '${mapName}' on date '${date}'` };
    const data = await res.json();
    
    const humans = new Set();
    const bots = new Set();
    let pvpKills = 0, botKills = 0, pvpDeaths = 0, stormDeaths = 0, loot = 0, killedByBot = 0;
    
    for (const e of data) {
        if (e.is_bot) bots.add(e.user_id);
        else humans.add(e.user_id);
        
        switch (e.event) {
          case 'Kill': pvpKills++; break;
          case 'Killed': pvpDeaths++; break;
          case 'BotKill': botKills++; break;
          case 'BotKilled': killedByBot++; break;
          case 'KilledByStorm': stormDeaths++; break;
          case 'Loot': loot++; break;
        }
    }
    
    return {
      success: true,
      mapName,
      date,
      total_events: data.length,
      human_players: humans.size,
      bot_players: bots.size,
      pvp_kills: pvpKills,
      pvp_deaths: pvpDeaths,
      bot_kills: botKills,
      killed_by_bot: killedByBot,
      storm_deaths: stormDeaths,
      loot_pickups: loot
    };
  } catch (err) {
    return { error: err.message };
  }
}

async function generateGeminiResponse(history) {
  let internalHistory = [...history.map(msg => ({
    role: msg.role === 'ai' ? 'model' : 'user',
    parts: [{ text: msg.text }]
  }))];

  while (true) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: internalHistory,
        systemInstruction: {
          role: "system",
          parts: [{ text: "You are Kaleen Bhaiya, an AI built into the LILA telemetry analytics dashboard. Help the user analyze their match data. If they ask about game stats or specific matches, ALWAYS use your tools first to search the JSON files, then answer based on the real data." }]
        },
        tools: [{
          functionDeclarations: [
            {
              name: "get_index_info",
              description: "Returns a list of all available maps and dates that have telemetry data.",
              parameters: { type: "OBJECT", properties: {} }
            },
            {
              name: "get_telemetry_stats",
              description: "Fetches aggregated game telemetry statistics for a specific map and date.",
              parameters: {
                type: "OBJECT",
                properties: {
                  map_name: { type: "STRING", description: "Map name (e.g., AmbroseValley, GrandRift, Lockdown)" },
                  date: { type: "STRING", description: "Date string (e.g., February_10, February_11)" }
                },
                required: ["map_name", "date"]
              }
            }
          ]
        }]
      })
    });
    
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    
    const part = data.candidates[0].content.parts[0];
    
    if (part.functionCall) {
      const { name, args } = part.functionCall;
      let functionResult;
      
      if (name === 'get_index_info') {
        functionResult = await queryIndexInfo();
      } else if (name === 'get_telemetry_stats') {
        functionResult = await queryTelemetryData(args.map_name, args.date);
      } else {
        functionResult = { error: "Unknown function" };
      }
      
      internalHistory.push({ role: "model", parts: [{ functionCall: part.functionCall }] });
      internalHistory.push({
        role: "function",
        parts: [{ functionResponse: { name, response: { result: functionResult } } }]
      });
      // Loop continues, allowing model to generate a text response with the new function data
    } else if (part.text) {
      return part.text;
    } else {
      throw new Error("Unexpected API response format");
    }
  }
}

export default function ChatSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: 'Hello! I am Kaleen Bhaiya. How can I help you analyze the match telemetry today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { id: Date.now(), role: 'user', text: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const responseText = await generateGeminiResponse(newMessages);
      setMessages(prev => [...prev, { id: Date.now(), role: 'ai', text: responseText }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), role: 'ai', text: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Box sx={{
        width: 48,
        height: '100%',
        bgcolor: '#18181b', // matching background.paper
        borderLeft: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 2
      }}>
        <Tooltip title="Open Assistant" placement="left">
          <IconButton onClick={() => setIsOpen(true)} sx={{ color: 'text.secondary', bgcolor: 'rgba(255,255,255,0.05)' }}>
            <ChatIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box sx={{
      width: 360,
      height: '100%',
      bgcolor: '#18181b', // Match app paper theme
      borderLeft: 1,
      borderColor: 'divider',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Header */}
      <Box sx={{
        px: 2, py: 1.5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: 1, borderColor: 'divider',
        bgcolor: 'rgba(255,255,255,0.02)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon sx={{ color: '#00ff88', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
            KALEEN BHAIYA
          </Typography>
        </Box>
        <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5
      }}>
        {messages.map((msg) => (
          <Box key={msg.id} sx={{
            display: 'flex',
            gap: 1.5,
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
          }}>
            <Avatar sx={{
              width: 28, height: 28,
              bgcolor: msg.role === 'user' ? 'primary.dark' : 'rgba(255,255,255,0.1)',
              color: msg.role === 'user' ? '#fff' : '#00ff88'
            }}>
              {msg.role === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
            </Avatar>
            <Box sx={{
              maxWidth: '75%',
              bgcolor: msg.role === 'user' ? 'primary.dark' : 'rgba(255,255,255,0.05)',
              color: 'text.primary',
              p: 1.5,
              borderRadius: 2,
              borderTopRightRadius: msg.role === 'user' ? 0 : 8,
              borderTopLeftRadius: msg.role === 'user' ? 8 : 0,
            }}>
              {msg.text.split('\n').map((line, i) => (
                <Typography key={i} variant="body2" sx={{ fontSize: '0.85rem', minHeight: line ? 'auto' : 8 }}>
                  {line}
                </Typography>
              ))}
            </Box>
          </Box>
        ))}
        {loading && (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: 'rgba(255,255,255,0.1)', color: '#00ff88' }}>
              <SmartToyIcon fontSize="small" />
            </Avatar>
            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, borderTopLeftRadius: 0, display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={16} sx={{ color: '#00ff88' }} />
            </Box>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.02)' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Ask Kaleen Bhaiya..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="outlined"
          InputProps={{
            sx: {
              bgcolor: 'background.default',
              borderRadius: 2,
              fontSize: '0.85rem',
              p: 1.5,
            },
            endAdornment: (
              <IconButton 
                size="small" 
                onClick={handleSend} 
                disabled={!input.trim() || loading}
                sx={{
                  color: input.trim() && !loading ? '#00ff88' : 'text.disabled',
                  alignSelf: 'flex-end',
                  ml: 1
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            )
          }}
        />
      </Box>
    </Box>
  );
}
