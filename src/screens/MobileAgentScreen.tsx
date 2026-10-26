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
  { label: '🍚 Food Insecurity & Malnutrition', query: 'Formulate CHO nutrition and feeding program justification under RA 11223.' },
  { label: '💼 Unbanked & NEET Youth Aid', query: 'CSWDO cash aid payout and technical livelihood training for youth.' },
];

export const MobileAgentScreen: React.FC = () => {
  const { selectedBarangay, isOnline } = useOffline();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: "msg-1",
      sender: "agent",
      text: `Kumusta, Kapitan! I am Banwaan Mobile Copilot (Statutory Decision Engine). Analyzing ${selectedBarangay.name} (${selectedBarangay.total_households.toLocaleString()} HHs, ${selectedBarangay.total_population.toLocaleString()} residents, MVI ${selectedBarangay.vulnerability_index}). I ensure all council resolutions and AIP proposals align with Philippine statutes and UN SDGs. How can I assist today?`,
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
        if (!res.ok) throw new Error("Agent endpoint rejected the query");
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
        // Fallback to offline synthesis below
      }
    }

    // Local Offline Statutory Decision Engine
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
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>STATUTORY COPILOT</Text>
          </View>
          <View style={styles.modelPill}>
            <Text style={styles.modelText}>Local Rule-Based & CBMS Engine</Text>
          </View>
        </View>
        <Text style={styles.title}>Banwaan Statutory Decision Support</Text>
        <Text style={styles.subtitle}>
          Target: {selectedBarangay.name} • Grounded in RA 7160, RA 10121 & UN SDGs
        </Text>
      </View>

      {/* Quick Prompt Chips */}
      <View style={styles.quickPromptsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickPromptsList}>
          {QUICK_PROMPTS.map((p, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.promptChip}
              onPress={() => handleSend(p.query)}
              activeOpacity={0.7}
            >
              <Text style={styles.promptChipText}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Messages Scroll View */}
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
                    <Text style={styles.agentBadge}>BANWAAN STATUTORY SYNTHESIS</Text>
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

                {/* Statutory Citations & SDG Badges */}
                {m.statute && (
                  <View style={styles.citationBox}>
                    <Text style={styles.citationText}>⚖️ Statutory Mandate: {m.statute}</Text>
                    {m.sdg && <Text style={styles.sdgText}>🎯 {m.sdg}</Text>}
                    {m.suggestedAction && (
                      <Text style={styles.actionText}>💡 Suggested Action: {m.suggestedAction}</Text>
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

      {/* macOS Spotlight / Siri Style Prompt Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask statutory basis, DRRM allocation, or AIP proposal..."
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: macosColors.windowBackground,
  },
  headerCard: {
    backgroundColor: macosColors.cardBackground,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: macosColors.cardBorder,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badge: {
    backgroundColor: macosColors.appleBlueSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  badgeText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.appleBlue,
    letterSpacing: 0.5,
  },
  modelPill: {
    backgroundColor: macosColors.controlBackground,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  modelText: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '600',
    color: macosColors.textTertiary,
  },
  title: {
    fontFamily: sfFont,
    fontSize: 18,
    fontWeight: '700',
    color: macosColors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '400',
    color: macosColors.textSecondary,
    marginTop: 2,
  },
  quickPromptsWrapper: {
    backgroundColor: macosColors.sidebarBackground,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: macosColors.cardBorder,
  },
  quickPromptsList: {
    paddingHorizontal: 12,
    gap: 6,
  },
  promptChip: {
    backgroundColor: macosColors.controlBackground,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: macosColors.controlBorder,
  },
  promptChipText: {
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
    gap: 12,
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
    borderRadius: 14,
    padding: 12,
  },
  bubbleUser: {
    backgroundColor: macosColors.appleBlue,
    borderBottomRightRadius: 4,
  },
  bubbleAgent: {
    backgroundColor: macosColors.cardBackground,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
    borderBottomLeftRadius: 4,
  },
  bubbleAgentHeader: {
    marginBottom: 4,
  },
  agentBadge: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '700',
    color: macosColors.nagaGold,
    letterSpacing: 0.5,
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
    borderTopColor: macosColors.cardBorder,
    gap: 4,
  },
  citationText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.appleYellow,
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
    fontWeight: '700',
    color: macosColors.appleBlue,
    backgroundColor: macosColors.appleBlueSubtle,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: macosColors.sidebarBackground,
    borderTopWidth: 1,
    borderTopColor: macosColors.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: sfFont,
    backgroundColor: macosColors.inputBackground,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 12,
    color: macosColors.textPrimary,
    borderWidth: 1,
    borderColor: macosColors.inputBorder,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: macosColors.appleBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: macosColors.controlBackground,
    opacity: 0.5,
  },
  sendBtnText: {
    fontFamily: sfFont,
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
