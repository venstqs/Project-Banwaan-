import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useOffline } from '../context/OfflineContext';
import { AGENT_ENDPOINT } from '../config/api';
import { macosColors, macosTypography, sfFont } from '../config/macosTheme';

interface AgentMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  statute?: string;
  sdg?: string;
  suggestedAction?: string;
  budget?: string;
}

const QUICK_PROMPTS = [
  { label: '🛡️ Typhoon Evac & Light Roofs', query: 'Synthesize DRRMO flood disaster shelter and light roof assistance for my barangay.' },
  { label: '💧 Safe Drinking Water Gap', query: 'Draft CEO infrastructure proposal for refilling station and water testing.' },
  { label: '🍚 Food Insecurity & Nutrition', query: 'Formulate CHO nutrition and feeding program justification under RA 11223.' },
  { label: '💼 NEET Youth & Cash-Aid', query: 'CSWDO cash aid payout and technical livelihood training for youth.' },
];

export const MobileAgentScreen: React.FC = () => {
  const { selectedBarangay, isOnline } = useOffline();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: "msg-1",
      sender: "agent",
      text: `Kumusta, Kapitan! I am Banwaan Statutory Copilot. Analyzing ${selectedBarangay.name} (${selectedBarangay.total_households.toLocaleString()} HHs, ${selectedBarangay.total_population.toLocaleString()} residents, MVI ${selectedBarangay.vulnerability_index}). All council resolutions and proposals align with Philippine statutes and the 17 UN SDGs.`,
      statute: "RA 7160 (Local Government Code Sec. 389)",
      sdg: "SDG 11 Sustainable Cities & Communities",
      budget: "20% Local Development Fund (LDF)"
    }
  ]);

  const handleSend = async (customText?: string) => {
    const activeQuery = (customText ?? query).trim();
    if (!activeQuery) return;

    const userMsg: AgentMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: activeQuery
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setQuery('');
    setIsLoading(true);

    if (isOnline) {
      try {
        const res = await fetch(AGENT_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: "barangay_captain",
            query: activeQuery,
            barangay_id: selectedBarangay.id
          })
        });
        if (!res.ok) throw new Error("Agent endpoint rejected query");
        const data = await res.json();
        const p = data.proposal_draft || data.drafted_proposal || {};
        const basis = p.statutory_basis || data.statutory_basis || {};
        const sdgs: string[] = p.sdgs || data.sdgs || [];
        const actions: string[] = p.suggested_actions || data.suggested_actions || [];
        setMessages((prev) => [
          ...prev,
          {
            id: `agt-${Date.now()}`,
            sender: 'agent',
            text: data.ai_synthesis || data.response_text || "Synthesis completed.",
            statute: basis.law ? `${basis.law} - ${basis.section || ""}` : undefined,
            sdg: sdgs.length ? sdgs.join(', ') : undefined,
            suggestedAction: actions.length ? actions.join(' • ') : undefined,
            budget: p.estimated_budget_php
              ? `₱${Number(p.estimated_budget_php).toLocaleString()}`
              : undefined
          }
        ]);
        setIsLoading(false);
        return;
      } catch {
        // Fallback to offline rule-based engine
      }
    }

    // Local Rule-Based Statutory Inference
    setTimeout(() => {
      let reply: AgentMessage;
      const q = activeQuery.toLowerCase();
      const hh = selectedBarangay.total_households;
      const pop = selectedBarangay.total_population;
      const mvi = selectedBarangay.vulnerability_index;

      if (q.includes("disaster") || q.includes("typhoon") || q.includes("flood") || q.includes("roof")) {
        const calcBudget = Math.round((120000 + hh * 85) / 5000) * 5000;
        reply = {
          id: `agt-${Date.now()}`,
          sender: "agent",
          text: `[DRRMO Synthesis] Analyzing ${selectedBarangay.name} (${hh.toLocaleString()} HHs, ${pop.toLocaleString()} residents, MVI ${mvi}). Under RA 10121, your council can allocate 5% LDRRMF to reinforce vulnerable light-roof shelters and broadcast localized Bikol storm bulletins.`,
          statute: "RA 10121 Section 12 (c) (6) & Section 21",
          sdg: "SDG 11.5 & SDG 13.1 (Climate Resilience)",
          suggestedAction: `Pass Sangguniang Barangay Resolution adopting the BDRRM Plan for ${selectedBarangay.name} and route to Mayor.`,
          budget: `₱${calcBudget.toLocaleString()}`
        };
      } else if (q.includes("water") || q.includes("drinking") || q.includes("station") || q.includes("ceo")) {
        reply = {
          id: `agt-${Date.now()}`,
          sender: "agent",
          text: `[CEO Synthesis] For ${selectedBarangay.name}, where drinking refilling dependence is ${selectedBarangay.infrastructure_ceo?.drinking_refilling_pct || 75}%, RA 7160 Sec. 17 mandates local water supply and communal refilling infrastructure.`,
          statute: "RA 7160 Sec. 17 (b) (1) (vii)",
          sdg: "SDG 6.1 (Clean Water & Sanitation)",
          suggestedAction: `Request City Engineer's Office pipeline inspection and solar-powered communal filtration unit.`,
          budget: `₱650,000`
        };
      } else {
        reply = {
          id: `agt-${Date.now()}`,
          sender: "agent",
          text: `[Executive Synthesis] For ${selectedBarangay.name}, aligning empirical CBMS indicators with City Ordinance No. 2024-089. Sangguniang Barangay can initiate an AIP capital investment resolution backed by 20% Local Development Fund.`,
          statute: "RA 7160 Sec. 287 (20% LDF Statutory Mandate)",
          sdg: "SDG 11 (Sustainable Cities) & SDG 16 (Peace & Strong Institutions)",
          suggestedAction: "Submit formal endorsement to CPDO Head for inclusion in AIP 2026 executive agenda.",
          budget: `₱${(hh * 120).toLocaleString()}`
        };
      }

      setMessages((prev) => [...prev, reply]);
      setIsLoading(false);
    }, 600);
  };

  return (
    <View style={styles.container}>
      {/* Header Card with Blue Gradient Orb Icon */}
      <View style={styles.headerCard}>
        <View style={styles.orbRow}>
          <View style={styles.orbCircle}>
            <View style={styles.orbInner} />
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.headerGreeting}>Welcome, Kapitan</Text>
            <Text style={styles.headerTitle}>What statutory inquiry can I help with?</Text>
          </View>
        </View>

        {/* Quick Suggestion Pills (Directly from Reference Image) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptScroller}>
          {QUICK_PROMPTS.map((p, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.promptPill}
              onPress={() => handleSend(p.query)}
              activeOpacity={0.7}
            >
              <Text style={styles.promptPillText}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <View
              key={m.id}
              style={[
                styles.messageRow,
                isUser ? styles.messageRowUser : styles.messageRowAgent,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  isUser ? styles.bubbleUser : styles.bubbleAgent,
                ]}
              >
                {!isUser && (
                  <View style={styles.bubbleAgentHeader}>
                    <Text style={styles.agentTag}>BANWAAN STATUTORY SYNTHESIS</Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.messageText,
                    isUser ? styles.messageTextUser : styles.messageTextAgent,
                  ]}
                >
                  {m.text}
                </Text>

                {m.statute && (
                  <View style={styles.citationBox}>
                    <Text style={styles.citationText}>⚖️ Mandate: {m.statute}</Text>
                    {m.sdg && <Text style={styles.sdgText}>🎯 {m.sdg}</Text>}
                    {m.suggestedAction && (
                      <Text style={styles.actionText}>💡 Action: {m.suggestedAction}</Text>
                    )}
                    {m.budget && (
                      <View style={styles.budgetRow}>
                        <Text style={styles.budgetTag}>EST. ALLOTMENT: {m.budget}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {isLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={macosColors.appleBlue} />
            <Text style={styles.loadingText}>Synthesizing CBMS indicators & statutory corpus...</Text>
          </View>
        )}
      </ScrollView>

      {/* OrchestrateIQ Prompt Bar Container */}
      <View style={styles.inputContainer}>
        <View style={styles.inputPillBox}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything regarding statutory basis or budget..."
            placeholderTextColor={macosColors.textTertiary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !query.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!query.trim() || isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: macosColors.windowBackground,
  },
  headerCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: macosColors.cardBorder,
  },
  orbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  orbCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  orbInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: macosColors.appleBlue,
  },
  headerTextCol: {
    flex: 1,
  },
  headerGreeting: {
    fontFamily: sfFont,
    fontSize: 16,
    fontWeight: '800',
    color: macosColors.textPrimary,
  },
  headerTitle: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '500',
    color: macosColors.textSecondary,
    marginTop: 1,
  },
  promptScroller: {
    gap: 6,
  },
  promptPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  promptPillText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '600',
    color: macosColors.textSecondary,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 14,
    gap: 10,
    paddingBottom: 20,
  },
  messageRow: {
    flexDirection: 'row',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAgent: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '88%',
    borderRadius: 18,
    padding: 13,
  },
  bubbleUser: {
    backgroundColor: macosColors.appleBlue,
    borderBottomRightRadius: 4,
    shadowColor: '#05389f',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  bubbleAgent: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  bubbleAgentHeader: {
    marginBottom: 4,
  },
  agentTag: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '800',
    color: macosColors.appleBlue,
    letterSpacing: 0.4,
  },
  messageText: {
    fontFamily: sfFont,
    fontSize: 12,
    lineHeight: 18,
  },
  messageTextUser: {
    color: '#ffffff',
    fontWeight: '500',
  },
  messageTextAgent: {
    color: macosColors.textPrimary,
    fontWeight: '400',
  },
  citationBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 4,
  },
  citationText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: '#92400e',
  },
  sdgText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '600',
    color: macosColors.appleGreen,
  },
  actionText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '500',
    color: macosColors.textSecondary,
  },
  budgetRow: {
    marginTop: 4,
  },
  budgetTag: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '800',
    color: macosColors.appleBlue,
    backgroundColor: macosColors.appleBlueSubtle,
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  loadingText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '500',
    color: macosColors.textTertiary,
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: macosColors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputPillBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fc',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    fontFamily: sfFont,
    fontSize: 12,
    color: macosColors.textPrimary,
    paddingVertical: 8,
  },
  sendBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: macosColors.appleBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  sendBtnDisabled: {
    backgroundColor: '#e2e8f0',
  },
  sendBtnText: {
    fontFamily: sfFont,
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
