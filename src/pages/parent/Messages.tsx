import { useEffect, useState, useMemo } from "react";
import {
  Paper, Typography, Box, Avatar, Stack, TextField, Button,
  Grid, MenuItem, Chip, List, ListItemButton, ListItemAvatar, ListItemText,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { teachers, parents } from "@/demo-data";
import { addMessage, getMessages, MESSAGE_STORE_EVENT } from "@/demo-data/communication/messageStore";
import type { Message } from "@/types";

type Audience = "all" | "teacher" | "admin";

function getRoleFromId(id: string): string {
  if (id === "admin") return "admin";
  if (id.startsWith("par")) return "parent";
  if (id.startsWith("t")) return "teacher";
  return "staff";
}

function buildConversations(rows: Message[], myId: string) {
  const convMap = new Map<string, { contactId: string; contactName: string; contactRole: string; messages: Message[]; lastTimestamp: string }>();
  rows.forEach((m) => {
    const contactId = m.sender_id === myId ? m.receiver_id : m.sender_id;
    const contactName = m.sender_id === myId ? m.receiver_name : m.sender_name;
    if (!convMap.has(contactId)) {
      convMap.set(contactId, { contactId, contactName, contactRole: getRoleFromId(contactId), messages: [], lastTimestamp: m.timestamp });
    }
    const conv = convMap.get(contactId)!;
    conv.messages.push(m);
    if (m.timestamp > conv.lastTimestamp) conv.lastTimestamp = m.timestamp;
  });
  return Array.from(convMap.values()).sort((a, b) => +new Date(b.lastTimestamp) - +new Date(a.lastTimestamp));
}

export default function ParentMessages() {
  const { user } = useAuth();
  const parent = parents.find((p) => p.id === user?.id);
  const myId = user?.id ?? "";

  const [rows, setRows] = useState<Message[]>(() => getMessages());
  const myMessages = useMemo(() => rows.filter((m) => m.sender_id === myId || m.receiver_id === myId), [rows, myId]);
  const conversations = useMemo(() => buildConversations(myMessages, myId), [myMessages, myId]);

  const [query, setQuery] = useState("");
  const [audience, setAudience] = useState<Audience>("all");
  const [selectedContact, setSelectedContact] = useState<string | null>(conversations[0]?.contactId ?? null);
  const [receiverId, setReceiverId] = useState("");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const onUpdate = () => setRows(getMessages());
    window.addEventListener(MESSAGE_STORE_EVENT, onUpdate);
    return () => window.removeEventListener(MESSAGE_STORE_EVENT, onUpdate);
  }, []);

  const recipients = useMemo(() => [
    { id: "admin", name: "Principal / School Office", role: "admin" },
    ...teachers.map((t) => ({ id: t.id, name: t.name, role: "teacher" })),
  ], []);

  const filteredConversations = conversations.filter((c) => {
    if (audience !== "all" && c.contactRole !== audience) return false;
    if (query && !`${c.contactName} ${c.messages.map((m) => m.content).join(" ")}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const activeConversation = conversations.find((c) => c.contactId === selectedContact);
  const activeMessages = activeConversation?.messages.sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp)) ?? [];

  const handleSend = () => {
    const target = selectedContact || receiverId;
    if (!draft.trim() || !target) return;
    const contact = recipients.find((u) => u.id === target);
    if (!contact) return;
    const newMessage: Message = {
      id: `m-${Date.now()}`,
      sender_id: myId,
      receiver_id: contact.id,
      sender_name: parent?.name ?? "Parent",
      receiver_name: contact.name,
      content: draft.trim(),
      timestamp: new Date().toISOString(),
    };
    addMessage(newMessage);
    setDraft("");
    setSelectedContact(contact.id);
  };

  return (
    <>
      <PageHeader
        title="Messages"
        breadcrumbs={[{ label: "Dashboard", to: "/parent" }, { label: "Messages" }]}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth size="small" label="Search messages" placeholder="Search by name or message" value={query} onChange={(e) => setQuery(e.target.value)} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField fullWidth select size="small" label="Filter" value={audience} onChange={(e) => setAudience(e.target.value as Audience)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="admin">School Office</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ px: 2, py: 1.2, display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%" }}>
            <Typography variant="body2" color="text.secondary">Conversations</Typography>
            <Chip label={filteredConversations.length} size="small" color="primary" />
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Conversation list */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ maxHeight: 520, overflow: "auto" }}>
            <List disablePadding>
              {filteredConversations.map((conv) => (
                <ListItemButton
                  key={conv.contactId}
                  selected={selectedContact === conv.contactId}
                  onClick={() => setSelectedContact(conv.contactId)}
                  sx={{ borderBottom: "1px solid", borderColor: "divider" }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ width: 36, height: 36, fontSize: 14, bgcolor: "primary.main" }}>
                      {conv.contactName.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={conv.contactName}
                    secondary={conv.messages[conv.messages.length - 1]?.content.slice(0, 40) + "..."}
                    slotProps={{ primary: { variant: "subtitle2" }, secondary: { variant: "caption", noWrap: true } }}
                  />
                  <Chip label={conv.contactRole === "admin" ? "Office" : conv.contactRole} size="small" variant="outlined" sx={{ ml: 1, textTransform: "capitalize" }} />
                </ListItemButton>
              ))}
              {filteredConversations.length === 0 && (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">No conversations found</Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Chat area */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2, minHeight: 520, display: "flex", flexDirection: "column" }}>
            {activeConversation ? (
              <>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1.5, borderBottom: 1, borderColor: "divider" }}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: "primary.main" }}>{activeConversation.contactName.charAt(0)}</Avatar>
                  <Typography variant="subtitle1" fontWeight={600}>{activeConversation.contactName}</Typography>
                  <Chip label={activeConversation.contactRole === "admin" ? "School Office" : activeConversation.contactRole} size="small" variant="outlined" sx={{ textTransform: "capitalize" }} />
                </Box>

                <Stack spacing={1.5} sx={{ flex: 1, overflowY: "auto", py: 2 }}>
                  {activeMessages.map((m) => {
                    const isMine = m.sender_id === myId;
                    return (
                      <Box key={m.id} sx={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                        <Box sx={{ maxWidth: "70%", p: 1.5, borderRadius: 2, bgcolor: isMine ? "primary.main" : "action.hover", color: isMine ? "white" : "text.primary" }}>
                          <Typography variant="body2">{m.content}</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>{new Date(m.timestamp).toLocaleString()}</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>

                <Box sx={{ display: "flex", gap: 1, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
                  <TextField
                    fullWidth size="small" placeholder="Type a message..."
                    value={draft} onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                  />
                  <Button variant="contained" onClick={handleSend} disabled={!draft.trim()}>Send</Button>
                </Box>
              </>
            ) : (
              <>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>New Message</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select a conversation from the left, or start a new one below.
                </Typography>
                <TextField
                  fullWidth select size="small" label="Send to"
                  value={receiverId} onChange={(e) => setReceiverId(e.target.value)}
                  sx={{ mb: 1.5 }}
                >
                  {recipients.map((u) => (
                    <MenuItem key={u.id} value={u.id}>{u.name} ({u.role === "admin" ? "School Office" : u.role})</MenuItem>
                  ))}
                </TextField>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField fullWidth size="small" placeholder="Type a message..." value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }} />
                  <Button variant="contained" onClick={handleSend} disabled={!draft.trim() || !receiverId}>Send</Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
