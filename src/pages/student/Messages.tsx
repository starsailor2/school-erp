import { useState, useMemo, useEffect } from "react";
import {
  Paper, Typography, Box, Avatar, Stack, TextField, Button,
  MenuItem, List, ListItemButton, ListItemAvatar, ListItemText,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { teachers, students, classes } from "@/demo-data";
import { addMessage, getMessages, MESSAGE_STORE_EVENT } from "@/demo-data/communication/messageStore";
import type { Message } from "@/types";

function buildConversations(rows: Message[], myId: string) {
  const convMap = new Map<string, { contactId: string; contactName: string; messages: Message[]; lastTimestamp: string }>();
  rows.forEach((m) => {
    const contactId = m.sender_id === myId ? m.receiver_id : m.sender_id;
    const contactName = m.sender_id === myId ? m.receiver_name : m.sender_name;
    if (!convMap.has(contactId)) {
      convMap.set(contactId, { contactId, contactName, messages: [], lastTimestamp: m.timestamp });
    }
    const conv = convMap.get(contactId)!;
    conv.messages.push(m);
    if (m.timestamp > conv.lastTimestamp) conv.lastTimestamp = m.timestamp;
  });
  return Array.from(convMap.values()).sort((a, b) => +new Date(b.lastTimestamp) - +new Date(a.lastTimestamp));
}

export default function StudentMessages() {
  const { user } = useAuth();
  const myId = user?.id ?? "";
  const student = students.find((s) => s.id === myId);

  const [rows, setRows] = useState<Message[]>(() => getMessages());
  const myMessages = rows.filter((m) => m.sender_id === myId || m.receiver_id === myId);
  const conversations = useMemo(() => buildConversations(myMessages, myId), [myMessages, myId]);

  const [activeContact, setActiveContact] = useState(conversations[0]?.contactId ?? "");
  const activeConv = conversations.find((c) => c.contactId === activeContact);
  const [text, setText] = useState("");
  const [composing, setComposing] = useState(false);
  const [newTo, setNewTo] = useState("");
  const [newText, setNewText] = useState("");

  useEffect(() => {
    const onUpdate = () => setRows(getMessages());
    window.addEventListener(MESSAGE_STORE_EVENT, onUpdate);
    return () => window.removeEventListener(MESSAGE_STORE_EVENT, onUpdate);
  }, []);

  useEffect(() => {
    if (!activeContact && conversations.length > 0) {
      setActiveContact(conversations[0].contactId);
      return;
    }
    if (activeContact && !conversations.some((c) => c.contactId === activeContact) && conversations.length > 0) {
      setActiveContact(conversations[0].contactId);
    }
  }, [activeContact, conversations]);

  // Class teacher and subject teachers for "new message" options
  const cls = student ? classes.find((c) => c.id === student.class_id) : null;
  const sec = cls?.sections.find((s) => s.id === student?.section_id);
  const classTeacherId = sec?.class_teacher_id;
  const contactOptions = [
    { id: "admin", name: "School Office" },
    ...(classTeacherId ? [{ id: classTeacherId, name: `${teachers.find((t) => t.id === classTeacherId)?.name ?? "Class Teacher"} (Class Teacher)` }] : []),
    ...teachers.filter((t) => t.id !== classTeacherId).slice(0, 5).map((t) => ({ id: t.id, name: t.name })),
  ];

  const handleSend = () => {
    if (!text.trim() || !activeContact) return;
    const msg: Message = {
      id: `m${Date.now()}`, sender_id: myId, receiver_id: activeContact,
      content: text.trim(), timestamp: new Date().toISOString(),
      sender_name: student?.name ?? "Student",
      receiver_name: activeConv?.contactName ?? "",
    };
    addMessage(msg);
    setText("");
  };

  const handleNewSend = () => {
    if (!newText.trim() || !newTo) return;
    const contact = contactOptions.find((c) => c.id === newTo);
    const msg: Message = {
      id: `m${Date.now()}`, sender_id: myId, receiver_id: newTo,
      content: newText.trim(), timestamp: new Date().toISOString(),
      sender_name: student?.name ?? "Student",
      receiver_name: contact?.name ?? "",
    };
    addMessage(msg);
    setActiveContact(newTo);
    setComposing(false);
    setNewTo("");
    setNewText("");
  };

  return (
    <>
      <PageHeader title="Messages" breadcrumbs={[{ label: "Dashboard", to: "/student" }, { label: "Messages" }]} />
      <Paper sx={{ display: "flex", minHeight: 500 }}>
        {/* Sidebar */}
        <Box sx={{ width: 280, borderRight: 1, borderColor: "divider", flexShrink: 0 }}>
          <Box sx={{ p: 1.5, borderBottom: 1, borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle2">Conversations</Typography>
            <Button size="small" onClick={() => setComposing(true)}>New</Button>
          </Box>
          <List disablePadding>
            {conversations.map((conv) => (
              <ListItemButton
                key={conv.contactId}
                selected={conv.contactId === activeContact && !composing}
                onClick={() => { setActiveContact(conv.contactId); setComposing(false); }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: conv.contactId === "admin" ? "error.main" : "primary.main", fontSize: 14 }}>
                    {conv.contactName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={conv.contactName}
                  secondary={conv.messages[conv.messages.length - 1]?.content.slice(0, 30) + "..."}
                  slotProps={{ primary: { variant: "body2", fontWeight: 500 }, secondary: { variant: "caption", noWrap: true } }}
                />
              </ListItemButton>
            ))}
            {conversations.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: "center" }}>No conversations</Typography>
            )}
          </List>
        </Box>

        {/* Chat Area */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {composing ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>New Message</Typography>
              <Stack spacing={2}>
                <TextField select fullWidth size="small" label="To" value={newTo} onChange={(e) => setNewTo(e.target.value)}>
                  {contactOptions.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </TextField>
                <TextField fullWidth multiline rows={4} placeholder="Type your message..." value={newText} onChange={(e) => setNewText(e.target.value)} />
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" onClick={handleNewSend} disabled={!newTo || !newText.trim()}>Send</Button>
                  <Button variant="outlined" onClick={() => setComposing(false)}>Cancel</Button>
                </Stack>
              </Stack>
            </Box>
          ) : activeConv ? (
            <>
              {/* Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar sx={{ width: 32, height: 32, bgcolor: activeConv.contactId === "admin" ? "error.main" : "primary.main", fontSize: 13 }}>
                    {activeConv.contactName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={600}>{activeConv.contactName}</Typography>
                </Stack>
              </Box>
              {/* Messages */}
              <Box sx={{ flex: 1, overflow: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
                {activeConv.messages.sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp)).map((m) => {
                  const isMine = m.sender_id === myId;
                  return (
                    <Box key={m.id} sx={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                      <Box sx={{ maxWidth: "70%", p: 1.5, borderRadius: 2, bgcolor: isMine ? "primary.main" : "action.hover", color: isMine ? "primary.contrastText" : "text.primary" }}>
                        <Typography variant="body2">{m.content}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7, display: "block", textAlign: "right", mt: 0.5 }}>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
              {/* Input */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
                <Stack direction="row" spacing={1}>
                  <TextField fullWidth size="small" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())} />
                  <Button variant="contained" onClick={handleSend} disabled={!text.trim()}>
                    <SendIcon />
                  </Button>
                </Stack>
              </Box>
            </>
          ) : (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography color="text.secondary">Select a conversation or start a new one</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </>
  );
}
