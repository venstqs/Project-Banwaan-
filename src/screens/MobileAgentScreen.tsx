import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useOffline } from '../context/OfflineContext';
import { AGENT_ENDPOINT } from '../config/api';
import { macosColors, sfFont } from '../config/macosTheme';

interface AgentMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  statute?: string;
  sdg?: string;
  suggestedAction?: string;
  budget?: string;
  proposalDraft?: {
    title: string;
    office: string;
    problem: string;
    statute: string;
    sdgs: string[];
    budget: number;
  };
}

export const MobileAgentScreen: React.FC = () => {
  const {
    selectedBarangay,
    isOnline,
    mobileRole,
    endorseOrQueueProposal,
  } = useOffline();

  const isCaptain = mobileRole === 'barangay_captain';

  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [endorsedId, setEndorsedId] = useState<string | null>(null);

  const captainInitialText = `Kumusta, Kapitan! I am your Banwaan Statutory & SDG Policy AI Agent. Analyzing ${selectedBarangay.displayName} (${selectedBarangay.total_households.toLocaleString()} HHs, ${selectedBarangay.total_population.toLocaleString()} residents, MVI ${selectedBarangay.vulnerability_index}). Grounded in 2024 PSA CBMS data, RA 7160, RA 10121, and the 17 UN SDGs. I can audit SDG gaps, draft Sangguniang Barangay ordinances, and calculate AIP 2026 20% LDF budgets.`;

  const citizenInitialText = `Kumusta, Kababayan! I am Banwaan Resident Assistant. Welcome to the ${selectedBarangay.displayName} Community Desk. I can help you find barangay services, senior / PWD assistance (RA 9994), emergency 911 dispatch, health center schedules, and disaster safety instructions in English, Filipino, or Bikol Naga.`;

  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'msg-1',
      sender: 'agent',
      text: isCaptain ? captainInitialText : citizenInitialText,
      statute: isCaptain
        ? 'RA 7160 (Local Government Code Sec. 389)'
        : 'RA 10173 Data Privacy & Republic Act 7160',
      sdg: isCaptain ? 'SDG 11 Sustainable Cities & Communities' : 'SDG 3 Good Health & Well-Being',
      budget: isCaptain ? '20% Local Development Fund (LDF)' : undefined,
    },
  ]);

  // Update initial message when switching roles or barangay
  useEffect(() => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'agent',
        text: isCaptain ? captainInitialText : citizenInitialText,
        statute: isCaptain
          ? 'RA 7160 (Local Government Code Sec. 389)'
          : 'RA 10173 Data Privacy & Republic Act 7160',
        sdg: isCaptain ? 'SDG 11 Sustainable Cities & Communities' : 'SDG 3 Good Health & Well-Being',
        budget: isCaptain ? '20% Local Development Fund (LDF)' : undefined,
      },
    ]);
  }, [mobileRole, selectedBarangay.id]);

  const captainPrompts = [
    {
      label: '🎯 UN SDG Gap Audit',
      query: `Audit ${selectedBarangay.realName} CBMS deficits against the 17 UN SDGs and identify top statutory priorities.`,
    },
    {
      label: '⚖️ Statutory Policy Basis',
      query: `Cite exact RA 7160, RA 10121, and RA 11223 statutory mandates applicable to ${selectedBarangay.realName}'s highest household deficits.`,
    },
    {
      label: '📜 Draft AIP 2026 Ordinance',
      query: `Draft an AIP 2026 20% Local Development Fund project ordinance for ${selectedBarangay.realName} with budget allocation.`,
    },
    {
      label: '🛡️ RA 10121 Shelter & Roof Plan',
      query: `Formulate a DRRMO disaster evacuation and weak roof retrofitting mitigation plan for ${selectedBarangay.realName}.`,
    },
  ];

  const citizenPrompts = [
    {
      label: '🚨 Emergency 911 Hotlines',
      query: `What are the verified emergency contact numbers for CDRRMO Naga 911, BFP Fire, PNP Police, and BMC Hospital?`,
    },
    {
      label: '👵 Senior Citizen Pension & Benefits',
      query: `How can senior citizens and PWDs apply for social pension and healthcare discounts in ${selectedBarangay.realName}?`,
    },
    {
      label: '📑 Barangay Clearance & Indigency',
      query: `What are the requirements for getting a Barangay Clearance or Certificate of Indigency in ${selectedBarangay.realName}?`,
    },
    {
      label: '🏥 Free Health Center & UHC',
      query: `What free medical services and vaccination schedules are available at our barangay health station under Universal Health Care?`,
    },
  ];

  const activePrompts = isCaptain ? captainPrompts : citizenPrompts;

  const handleSend = async (customText?: string) => {
    const activeQuery = (customText ?? query).trim();
    if (!activeQuery) return;

    const userMsg: AgentMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: activeQuery,
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
            role: isCaptain ? 'barangay_captain' : 'citizen',
            query: activeQuery,
            barangay_id: selectedBarangay.id,
          }),
        });

        if (res.ok) {
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
              text: data.ai_synthesis || data.response_text || 'Synthesis completed.',
              statute: basis.law ? `${basis.law} - ${basis.section || ''}` : undefined,
              sdg: sdgs.length ? sdgs.join(', ') : undefined,
              suggestedAction: actions.length ? actions.join(' • ') : undefined,
              budget: p.estimated_budget_php
                ? `₱${Number(p.estimated_budget_php).toLocaleString()}`
                : undefined,
              proposalDraft: (p.title || p.project_title)
                ? {
                    title: p.title || p.project_title,
                    office: p.office || 'CPDO',
                    problem: p.problem_statement || p.problem || activeQuery,
                    statute: basis.law || 'RA 7160',
                    sdgs: sdgs.length ? sdgs : ['SDG 11 Sustainable Cities'],
                    budget: p.estimated_budget_php || 350000,
                  }
                : undefined,
            },
          ]);
          setIsLoading(false);
          return;
        }
      } catch {
        // Fallback to local rule engine
      }
    }

    // Local Statutory Rule Engine (Offline)
    setTimeout(() => {
      let reply: AgentMessage;
      const q = activeQuery.toLowerCase();
      const hh = selectedBarangay.total_households;
      const mvi = selectedBarangay.vulnerability_index;

      if (isCaptain) {
        if (q.includes('disaster') || q.includes('typhoon') || q.includes('flood') || q.includes('roof')) {
          const budgetNum = Math.round((120000 + hh * 85) / 5000) * 5000;
          reply = {
            id: `agt-${Date.now()}`,
            sender: 'agent',
            text: `[DRRMO Statutory Synthesis] For ${selectedBarangay.displayName} (${hh.toLocaleString()} HHs, MVI ${mvi}). Under RA 10121 Section 12 (c) (6) & Section 21, the Sangguniang Barangay may appropriate 5% of its estimated revenue for the Local Disaster Risk Reduction and Management Fund (LDRRMF). 70% is earmarked for preparedness (evacuation center retrofitting, lightweight roof reinforcement subsidies), and 30% for Quick Response Fund.`,
            statute: 'RA 10121 Sec. 12 & Sec. 21 (Disaster Risk Reduction Act)',
            sdg: 'SDG 11.5 & SDG 13.1 Climate Resilience',
            suggestedAction: `Enact Barangay Resolution authorizing pre-calamity roof reinforcement material procurement.`,
            budget: `₱${budgetNum.toLocaleString()}`,
            proposalDraft: {
              title: `Light-Roof Structural Reinforcement & DRRM Evacuation Facility (${selectedBarangay.realName})`,
              office: 'DRRMO',
              problem: `${selectedBarangay.drrm?.weak_roof_pct || 14}% of households have vulnerable roofing materials susceptible to typhoon damage.`,
              statute: 'RA 10121 Sec. 21',
              sdgs: ['SDG 11 Sustainable Cities', 'SDG 13 Climate Action'],
              budget: budgetNum,
            },
          };
        } else if (q.includes('water') || q.includes('refilling') || q.includes('pipe') || q.includes('ceo')) {
          reply = {
            id: `agt-${Date.now()}`,
            sender: 'agent',
            text: `[CEO Infrastructure Synthesis] In ${selectedBarangay.realName}, commercial water refilling station dependency is ${selectedBarangay.infrastructure_ceo?.drinking_refilling_pct || 75}%. Section 17 (b) (1) (vii) of RA 7160 mandates barangays to maintain communal water supply systems and artesian wells. Recommended action: Submit engineering requisition for solar-powered communal filtration facility.`,
            statute: 'RA 7160 Local Government Code Sec. 17 (b)(1)(vii)',
            sdg: 'SDG 6.1 Safe & Affordable Drinking Water',
            suggestedAction: `Request City Engineer's Office pipeline inspection and water filtration grant.`,
            budget: '₱650,000',
            proposalDraft: {
              title: `Communal Solar-Powered Potable Water Filtration Station (${selectedBarangay.realName})`,
              office: 'CEO',
              problem: `High commercial refilling station dependence (${selectedBarangay.infrastructure_ceo?.drinking_refilling_pct || 75}%) strains household budgets.`,
              statute: 'RA 7160 Sec. 17',
              sdgs: ['SDG 6 Clean Water & Sanitation'],
              budget: 650000,
            },
          };
        } else {
          reply = {
            id: `agt-${Date.now()}`,
            sender: 'agent',
            text: `[Council Statutory Plan] Evaluated ${selectedBarangay.displayName}. Sangguniang Barangay has full statutory authority under RA 7160 Sec. 389 to enact annual AIP budgets, appropriate 20% Local Development Funds for priority capital investments, and enter into co-financing agreements with the City Government of Naga.`,
            statute: 'RA 7160 Sec. 389 (Powers & Duties of Punong Barangay)',
            sdg: 'SDG 11 Sustainable Cities & Communities',
            suggestedAction: `Adopt 2026 AIP Investment Resolution during the next regular barangay session.`,
            budget: '₱500,000',
            proposalDraft: {
              title: `AIP 2026 Barangay Community Priority Infrastructure Program (${selectedBarangay.realName})`,
              office: 'CPDO',
              problem: `Priority community development interventions based on 2024 CBMS multidimensional deficits.`,
              statute: 'RA 7160 Sec. 389',
              sdgs: ['SDG 11 Sustainable Cities'],
              budget: 500000,
            },
          };
        }
      } else {
        // Citizen Resident Replies
        if (q.includes('senior') || q.includes('pwd') || q.includes('pension')) {
          reply = {
            id: `agt-${Date.now()}`,
            sender: 'agent',
            text: `[Citizen Assistance] Para sa satuyang mga Senior Citizens asin PWDs sa ${selectedBarangay.realName}: Sa irarom kan Republic Act 9994 (Expanded Senior Citizens Act) asin City Ordinance No. 2022-045, igwa kamong 20% discount sa bulong asin kakanon, 5% utility discount, asin kwalipikado sa DSWD/CSWDO Social Pension (₱1,000 kada bulan). Magduman sa Barangay Hall daradara an valid ID asin Certificate of Indigency.`,
            statute: 'Republic Act 9994 (Expanded Senior Citizens Act) & RA 7277 (Magna Carta for PWDs)',
            sdg: 'SDG 10 Reduced Inequalities & SDG 1 No Poverty',
            suggestedAction: `Visit the Senior Citizens Affairs Office (OSCA) Desk at ${selectedBarangay.realName} Barangay Hall (Mon-Fri 8AM-5PM).`,
          };
        } else if (q.includes('clearance') || q.includes('indigency') || q.includes('certificate')) {
          reply = {
            id: `agt-${Date.now()}`,
            sender: 'agent',
            text: `[Barangay Document Desk] Pagkuha nin Barangay Clearance / Indigency sa ${selectedBarangay.realName}:\n1. Darahon an saro (1) na valid government ID o school ID.\n2. Proof of residency (kun bago sa barangay) o pagmidbid kan Purok Leader.\n3. Para sa Certificate of Indigency para sa scholarship o medical aid, libre ini sa irarom kan RA 11261 (First Time Jobseekers Act) asin LGU Naga pro-poor ordinance. Releasing period: 10–15 minutos.`,
            statute: 'RA 7160 Sec. 152 & RA 11261 (First Time Jobseekers Act)',
            sdg: 'SDG 16 Peace, Justice and Strong Institutions',
            suggestedAction: `Approach the Barangay Secretary's window at the Barangay Hall.`,
          };
        } else {
          reply = {
            id: `agt-${Date.now()}`,
            sender: 'agent',
            text: `[Resident Service Advisor] Kumusta! Sa Brgy ${selectedBarangay.realName}, an Barangay Health Station bukas para sa libreng check-up, bakuna sa mga aki, asin prenatal care sa irarom kan RA 11223 (Universal Health Care Act). Kun igwa kamo nin emergency, mag-dial tulos sa CDRRMO Naga Central 911: 911 • (054) 205-2980 (Mobile: 0908-525-3000) o PNP Police: 166.`,
            statute: 'RA 11223 (Universal Health Care Act)',
            sdg: 'SDG 3 Good Health & Well-being',
            suggestedAction: `Coordinate with your Barangay Health Worker (BHW) or visit the Barangay Health Center.`,
          };
        }
      }

      setMessages((prev) => [...prev, reply]);
      setIsLoading(false);
    }, 600);
  };

  const handleEndorseGeneratedProposal = async (msg: AgentMessage) => {
    if (!msg.proposalDraft) return;
    const p = msg.proposalDraft;
    setEndorsedId(msg.id);

    await endorseOrQueueProposal({
      barangay: selectedBarangay.displayName,
      office: p.office,
      title: p.title,
      problem: p.problem,
      statute: p.statute,
      section: 'Statutory AI Ordinance Synthesis',
      sdgs: p.sdgs,
      budget: p.budget,
    });

    Alert.alert(
      'Proposal Endorsed',
      `"${p.title}" has been formally submitted to the LGU Executive Review Queue & AIP 2026 investment pool.`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 1. Header Card */}
      <View style={styles.whiteCard}>
        <View style={styles.badgeRow}>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>
              {isCaptain ? 'STATUTORY & SDG POLICY AI AGENT' : 'COMMUNITY SERVICES DESK • BANWAAN AI'}
            </Text>
          </View>

          <View style={styles.statusPill}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOnline ? macosColors.appleGreen : macosColors.appleYellow },
              ]}
            />
            <Text style={styles.statusText}>{isOnline ? 'Groq Qwen 27B' : 'Offline Rule Engine'}</Text>
          </View>
        </View>

        <Text style={styles.title}>
          {isCaptain ? 'Sangguniang Barangay Policy Agent' : 'Community AI Resident Desk'}
        </Text>
        <Text style={styles.subtitle}>
          Empirical CBMS Data • UN SDGs • {isCaptain ? 'RA 7160 / RA 10121 Policy Synthesis' : 'Resident Welfare & Services Guidance'}
        </Text>
      </View>

      {/* 2. Quick Prompt Chips */}
      <View style={styles.whiteCard}>
        <Text style={styles.quickTitle}>
          {isCaptain ? 'SUGGESTED STATUTORY ACTIONS & RESOLUTIONS' : 'COMMONLY ASKED RESIDENT QUESTIONS'}
        </Text>
        <View style={styles.promptChipsWrapper}>
          {activePrompts.map((p, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.promptChip}
              onPress={() => handleSend(p.query)}
              activeOpacity={0.7}
            >
              <Text style={styles.promptChipText}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 3. Conversation Thread */}
      <View style={styles.chatCard}>
        <View style={styles.messagesList}>
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <View
                key={m.id}
                style={[
                  styles.msgRow,
                  isUser ? styles.msgRowUser : styles.msgRowAgent,
                ]}
              >
                {!isUser && <Text style={styles.avatarIcon}>{isCaptain ? '🏛️' : '🤖'}</Text>}
                <View
                  style={[
                    styles.msgBubble,
                    isUser ? styles.msgBubbleUser : styles.msgBubbleAgent,
                  ]}
                >
                  <Text
                    style={[
                      styles.msgText,
                      isUser ? styles.msgTextUser : styles.msgTextAgent,
                    ]}
                  >
                    {m.text}
                  </Text>

                  {/* Statutory & SDG Metadata Badges */}
                  {(m.statute || m.sdg || m.budget) && (
                    <View style={styles.metaBadgeGroup}>
                      {m.statute && (
                        <View style={styles.statutePill}>
                          <Text style={styles.statutePillText}>⚖️ {m.statute}</Text>
                        </View>
                      )}
                      {m.sdg && (
                        <View style={styles.sdgPill}>
                          <Text style={styles.sdgPillText}>🌐 {m.sdg}</Text>
                        </View>
                      )}
                      {m.budget && (
                        <View style={styles.budgetPill}>
                          <Text style={styles.budgetPillText}>💰 {m.budget}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {m.suggestedAction && (
                    <View style={styles.actionBox}>
                      <Text style={styles.actionLabel}>ACTION PLAN:</Text>
                      <Text style={styles.actionText}>{m.suggestedAction}</Text>
                    </View>
                  )}

                  {/* 1-Tap Endorse to LGU Button (Captain Mode) */}
                  {isCaptain && m.proposalDraft && (
                    <TouchableOpacity
                      style={[
                        styles.endorseBtn,
                        endorsedId === m.id && styles.endorseBtnDone,
                      ]}
                      onPress={() => handleEndorseGeneratedProposal(m)}
                      disabled={endorsedId === m.id}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.endorseBtnText}>
                        {endorsedId === m.id
                          ? 'ENDORSED TO LGU DESK ✓'
                          : '🏛️ Endorse Proposal to LGU / Mayor ↗'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}

          {isLoading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={macosColors.appleBlue} />
              <Text style={styles.loadingText}>Synthesizing statutory statutes & CBMS data...</Text>
            </View>
          )}
        </View>

        {/* Input Composer */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.queryInput}
            placeholder={
              isCaptain
                ? 'Ask Copilot to draft a resolution, budget, or statute...'
                : 'Ask about health, emergency aid, clearances, or hotlines...'
            }
            placeholderTextColor={macosColors.textTertiary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !query.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!query.trim() || isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: macosColors.windowBackground,
  },
  contentContainer: {
    padding: 14,
    gap: 12,
    paddingBottom: 28,
  },
  whiteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgePill: {
    backgroundColor: macosColors.appleBlueSubtle,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: macosColors.appleBlueBorder,
  },
  badgePillText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '800',
    color: macosColors.appleBlue,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '600',
    color: macosColors.textSecondary,
  },
  title: {
    fontFamily: sfFont,
    fontSize: 20,
    fontWeight: '800',
    color: macosColors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: sfFont,
    fontSize: 12,
    color: macosColors.textSecondary,
    marginTop: 2,
  },
  quickTitle: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '800',
    color: macosColors.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  promptChipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  promptChip: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  promptChipText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '600',
    color: macosColors.textPrimary,
  },
  chatCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  messagesList: {
    gap: 12,
    marginBottom: 12,
  },
  msgRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowAgent: {
    justifyContent: 'flex-start',
  },
  avatarIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  msgBubble: {
    borderRadius: 14,
    padding: 12,
    maxWidth: '85%',
  },
  msgBubbleUser: {
    backgroundColor: macosColors.appleBlue,
    borderBottomRightRadius: 4,
  },
  msgBubbleAgent: {
    backgroundColor: '#f8fafc',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  msgText: {
    fontFamily: sfFont,
    fontSize: 12,
    lineHeight: 18,
  },
  msgTextUser: {
    color: '#ffffff',
  },
  msgTextAgent: {
    color: macosColors.textPrimary,
  },
  metaBadgeGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 8,
  },
  statutePill: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statutePillText: {
    fontFamily: sfFont,
    fontSize: 9.5,
    fontWeight: '700',
    color: '#92400e',
  },
  sdgPill: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sdgPillText: {
    fontFamily: sfFont,
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1e40af',
  },
  budgetPill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  budgetPillText: {
    fontFamily: sfFont,
    fontSize: 9.5,
    fontWeight: '700',
    color: '#166534',
  },
  actionBox: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionLabel: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '800',
    color: macosColors.appleBlue,
    marginBottom: 2,
  },
  actionText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '500',
    color: macosColors.textSecondary,
    lineHeight: 16,
  },
  endorseBtn: {
    marginTop: 10,
    backgroundColor: macosColors.appleBlue,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  endorseBtnDone: {
    backgroundColor: '#16a34a',
  },
  endorseBtnText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  loadingText: {
    fontFamily: sfFont,
    fontSize: 11,
    color: macosColors.textSecondary,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  queryInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontFamily: sfFont,
    fontSize: 12,
    color: macosColors.textPrimary,
  },
  sendBtn: {
    backgroundColor: macosColors.appleBlue,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  sendBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
  sendBtnText: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});
