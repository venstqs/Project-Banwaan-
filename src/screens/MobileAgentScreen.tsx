import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useOffline } from '../context/OfflineContext';

interface AgentMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  statute?: string;
  sdg?: string;
  suggestedAction?: string;
}

export const MobileAgentScreen: React.FC = () => {
  const { selectedBarangay, isOnline } = useOffline();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: "msg-1",
      sender: "agent",
      text: `Kumusta, Kapitan! I am Banwaan Mobile AI. I specialize in evidence-based barangay recommendations for ${selectedBarangay.name}, strictly aligned with the 17 UN Sustainable Development Goals and Philippine statutory laws. How can I assist your council today?`,
      statute: "RA 7160 (Local Government Code Sec. 389)",
      sdg: "SDG 11 Sustainable Cities and Communities"
    }
  ]);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg: AgentMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = query;
    setQuery('');
    setIsLoading(true);

    // If online, query FastAPI endpoint; if offline, use local offline rule-based knowledge engine
    if (isOnline) {
      try {
        const res = await fetch('http://localhost:8000/api/agent/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: "barangay_captain",
            query: currentQuery,
            barangay_id: selectedBarangay.id
          })
        });
        const data = await res.json();
        const p = data.proposal_draft;
        setMessages((prev) => [
          ...prev,
          {
            id: `agt-${Date.now()}`,
            sender: 'agent',
            text: data.ai_synthesis,
            statute: `${p.statutory_basis.law} - ${p.statutory_basis.section}`,
            sdg: p.sdgs.join(', '),
            suggestedAction: p.suggested_actions.join(' • ')
          }
        ]);
        setIsLoading(false);
        return;
      } catch {
        // Fallback to offline synthesis below
      }
    }

    // Local Offline Intelligence
    setTimeout(() => {
      let reply: AgentMessage;
      const q = currentQuery.toLowerCase();
      if (q.includes("disaster") || q.includes("typhoon") || q.includes("flood") || q.includes("plan")) {
        reply = {
          id: `agt-${Date.now()}`,
          sender: "agent",
          text: `Under Republic Act 10121, ${selectedBarangay.name} is entitled to allocate 5% of its Local Disaster Risk Reduction and Management Fund (LDRRMF) to establish early warning megaphones, repair evacuation centers, and formalize the Barangay DRRM Plan.`,
          statute: "RA 10121 Section 12 (c) (6)",
          sdg: "SDG 11.5 & SDG 13.1 (Disaster Resilience & Climate Action)",
          suggestedAction: "Pass a Sangguniang Barangay Resolution adopting the 2026 BDRRM Plan and request DRRMO technical assistance."
        };
      } else if (q.includes("water") || q.includes("toilet") || q.includes("infrastructure") || q.includes("light")) {
        reply = {
          id: `agt-${Date.now()}`,
          sender: "agent",
          text: `Under Section 17 of RA 7160 (Local Government Code), the city must support communal sanitation and clean water connections for barangays with high refilling station dependency.`,
          statute: "RA 7160 Section 17 (b) (1)",
          sdg: "SDG 6 Clean Water and Sanitation & SDG 9 Resilient Infrastructure",
          suggestedAction: "Submit an engineering project request to the City Engineer's Office (CEO) for piped water extension."
        };
      } else {
        reply = {
          id: `agt-${Date.now()}`,
          sender: "agent",
          text: `Based on the CBMS profile for ${selectedBarangay.name}, priority programs should focus on social protection targeting and youth skills development under RA 11310.`,
          statute: "RA 11310 (4Ps Act Sec. 13)",
          sdg: "SDG 1 No Poverty & SDG 8 Decent Work",
          suggestedAction: "Coordinate with CSWDO for community-based livelihood registration."
        };
      }
      setMessages((prev) => [...prev, reply]);
      setIsLoading(false);
    }, 600);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>SDG-ALIGNED AGENTIC AI ASSISTANT</Text>
          <View style={[styles.modePill, { backgroundColor: isOnline ? '#065f46' : '#854d0e' }]}>
            <Text style={styles.modeText}>{isOnline ? 'Cloud Synced' : 'Offline Local Rules'}</Text>
          </View>
        </View>
        <Text style={styles.title}>Barangay Policy Advisor</Text>
        <Text style={styles.subtitle}>Strict statutory grounding in RA 10121, RA 7160, RA 9003, and UN SDGs</Text>
      </View>

      <ScrollView style={styles.chatArea}>
        {messages.map((m) => (
          <View key={m.id} style={[styles.bubble, m.sender === 'user' ? styles.userBubble : styles.agentBubble]}>
            <Text style={[styles.bubbleText, m.sender === 'user' ? styles.userText : styles.agentText]}>
              {m.text}
            </Text>

            {m.statute && (
              <View style={styles.statuteBox}>
                <Text style={styles.statuteLabel}>📜 Legal Citation:</Text>
                <Text style={styles.statuteVal}>{m.statute}</Text>
              </View>
            )}

            {m.sdg && (
              <View style={styles.sdgBox}>
                <Text style={styles.sdgLabel}>🎯 Aligned UN SDGs:</Text>
                <Text style={styles.sdgVal}>{m.sdg}</Text>
              </View>
            )}

            {m.suggestedAction && (
              <View style={styles.actionBox}>
                <Text style={styles.actionLabel}>💡 Recommended Action:</Text>
                <Text style={styles.actionVal}>{m.suggestedAction}</Text>
              </View>
            )}
          </View>
        ))}
        {isLoading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#38bdf8" />
            <Text style={styles.loadingText}>Synthesizing CBMS metrics & statutory references...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input row */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.chatInput}
          placeholder="Ask policy recommendations (e.g., funding for flood defense)..."
          placeholderTextColor="#64748b"
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendBtnText}>Ask AI</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 18, backgroundColor: '#1e293b', borderBottomWidth: 1, borderColor: '#334155' },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  badge: { color: '#38bdf8', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  modePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  modeText: { color: '#fef08a', fontSize: 9, fontWeight: '700' },
  title: { color: '#f8fafc', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  chatArea: { flex: 1, padding: 16 },
  bubble: { padding: 14, borderRadius: 12, marginBottom: 12, maxWidth: '92%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#0284c7' },
  agentBubble: { alignSelf: 'flex-start', backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  bubbleText: { fontSize: 13, lineHeight: 19 },
  userText: { color: '#ffffff', fontWeight: '500' },
  agentText: { color: '#f1f5f9' },
  statuteBox: { marginTop: 10, backgroundColor: '#0f172a', padding: 8, borderRadius: 6, borderLeftWidth: 3, borderLeftColor: '#38bdf8' },
  statuteLabel: { color: '#38bdf8', fontSize: 10, fontWeight: '700' },
  statuteVal: { color: '#cbd5e1', fontSize: 11, marginTop: 2 },
  sdgBox: { marginTop: 6, backgroundColor: '#0f172a', padding: 8, borderRadius: 6, borderLeftWidth: 3, borderLeftColor: '#10b981' },
  sdgLabel: { color: '#10b981', fontSize: 10, fontWeight: '700' },
  sdgVal: { color: '#cbd5e1', fontSize: 11, marginTop: 2 },
  actionBox: { marginTop: 6, backgroundColor: '#0f172a', padding: 8, borderRadius: 6, borderLeftWidth: 3, borderLeftColor: '#f59e0b' },
  actionLabel: { color: '#f59e0b', fontSize: 10, fontWeight: '700' },
  actionVal: { color: '#e2e8f0', fontSize: 11, marginTop: 2 },
  loadingBox: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  loadingText: { color: '#94a3b8', fontSize: 11, marginLeft: 8 },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#1e293b', borderTopWidth: 1, borderColor: '#334155' },
  chatInput: { flex: 1, backgroundColor: '#0f172a', color: '#f8fafc', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155', fontSize: 13 },
  sendBtn: { marginLeft: 8, backgroundColor: '#0284c7', paddingHorizontal: 16, justifyContent: 'center', borderRadius: 8 },
  sendBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '700' }
});
