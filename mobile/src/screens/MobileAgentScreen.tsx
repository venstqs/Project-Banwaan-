import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOffline } from '../context/OfflineContext';
import { getMviTier } from './BarangayCaptainScreen';

interface AgentMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  statute?: string;
  sdg?: string;
  suggestedAction?: string;
  budget?: string;
}

type SupportedLanguage = 'bikol' | 'filipino' | 'english';

const PROMPT_CHIPS = [
  'SDG Gap Audit',
  'Statutory Policy Basis',
  'Draft AIP Proposal',
  'Flood & DRRM Plan',
];

export const MobileAgentScreen: React.FC = () => {
  const { selectedBarangay, isOnline } = useOffline();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<any>(null);

  const currentTier = getMviTier(selectedBarangay.vulnerability_index);

  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'msg-1',
      sender: 'agent',
      text: `Statutory & CBMS Decision Engine is online. Analyzing ${selectedBarangay.name} (${selectedBarangay.total_households.toLocaleString()} households, Empirical MVI ${selectedBarangay.vulnerability_index}). Every intervention cites exact statutory authorities (RA 10121, RA 7160, RA 11223, RA 11310) and maps to the 17 UN Sustainable Development Goals.`,
      statute: 'RA 7160 Sec. 17 & RA 10121 Sec. 12',
      sdg: 'SDG 11 Sustainable Cities • SDG 17 Partnerships',
    },
  ]);

  const scrollToLatest = () => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  const detectLanguage = (text: string): SupportedLanguage => {
    const lower = text.toLowerCase();
    const bikolMarkers = [
      'marhay', 'aldaw', 'aga', 'banggi', 'hapon', 'sain', 'gurano', 'tano',
      'ngunyan', 'mabalos', 'dae', 'dai', 'igwa', 'wara', 'padi', 'tabang',
      'bako', 'iyo', 'sadi', 'duman', 'nindo', 'saimo', 'samuya', 'asin', 'padaba',
    ];
    const filipinoMarkers = [
      'ano', 'bakit', 'paano', 'saan', 'kailan', 'sino', 'magkano', 'kumusta',
      'kamusta', 'musta', 'salamat', 'umaga', 'gabi', 'tanghali', 'po', 'opo',
      'natin', 'namin', 'tayo', 'kami', 'meron', 'wala', 'hindi', 'oo', 'ayuda',
      'tulong', 'baha', 'tubig', 'nais', 'kailangan', 'palikuran', 'pamilya',
    ];

    if (bikolMarkers.some((w) => new RegExp(`\\b${w}\\b`, 'i').test(lower))) {
      return 'bikol';
    }
    if (filipinoMarkers.some((w) => new RegExp(`\\b${w}\\b`, 'i').test(lower))) {
      return 'filipino';
    }
    return 'english';
  };

  const handleSend = async (customText?: string) => {
    const activeQuery = (customText ?? query).trim();
    if (!activeQuery || isLoading) return;

    const userMsg: AgentMessage = { id: `usr-${Date.now()}`, sender: 'user', text: activeQuery };
    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setQuery('');
    setIsLoading(true);
    scrollToLatest();

    if (isOnline) {
      try {
        const res = await fetch('http://localhost:8000/api/agent/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'barangay_captain',
            query: activeQuery,
            barangay_id: selectedBarangay.id,
          }),
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
            sdg: p.sdgs.join(' • '),
            suggestedAction: p.suggested_actions.join(' • '),
            budget: `₱${Number(p.estimated_budget_php || 250000).toLocaleString()}`,
          },
        ]);
        setIsLoading(false);
        scrollToLatest();
        return;
      } catch {
        // Fallback to local offline synthesis
      }
    }

    setTimeout(() => {
      let reply: AgentMessage;
      const lang = detectLanguage(activeQuery);
      const lower = activeQuery.toLowerCase().trim();

      const hasWord = (...words: string[]) =>
        words.some((w) => new RegExp(`\\b${w}\\b`, 'i').test(lower));

      const hh = selectedBarangay.total_households;
      const mvi = selectedBarangay.vulnerability_index;

      // 1. GREETING INTENT (NO CARDS)
      const isGreeting = hasWord(
        'hi', 'hello', 'hey', 'sup', 'yo', 'good morning', 'good afternoon', 'good evening',
        'kumusta', 'kamusta', 'musta', 'magandang araw', 'magandang umaga', 'magandang hapon', 'magandang gabi',
        'marhay na aldaw', 'marhay na aga', 'marhay na hapon', 'marhay na banggi', 'dios marhay',
        'salamat', 'thanks', 'thank you', 'mabalos'
      );

      if (isGreeting) {
        let greetingText = '';
        if (lang === 'bikol') {
          greetingText = `Marhay na aldaw po, Kapitan! Andam akong magtabang sa pagsiyasat kan CBMS data, pagplano nin resolusyon, o pag-andam kan 2026 AIP programs para sa ${selectedBarangay.name}. Ano po an satuyang pag-oolayan ngunyan?`;
        } else if (lang === 'filipino') {
          greetingText = `Magandang araw po, Kapitan! Handa akong tumulong sa pagsusuri ng CBMS data, pagbalangkas ng resolusyon, o pagplano ng 2026 AIP projects para sa ${selectedBarangay.name}. Saang aspeto po natin nais magsimula?`;
        } else {
          greetingText = `Kumusta, Kapitan! I am ready to assist with CBMS vulnerability analysis, council resolutions, or 2026 AIP planning for ${selectedBarangay.name}. What topic would you like to review?`;
        }

        reply = {
          id: `agt-${Date.now()}`,
          sender: 'agent',
          text: greetingText,
        };
      }
      // 2. DISASTER, TYPHOON, & FLOODING
      else if (
        hasWord(
          'disaster', 'typhoon', 'flood', 'flooding', 'storm', 'calamity', 'roof',
          'baha', 'bagyo', 'unos', 'kalamidad', 'drrm', 'bdrrm', 'evacuation', 'bubong', 'uwan', 'uran'
        )
      ) {
        const calcBudget = Math.round((120000 + hh * 85) / 5000) * 5000;
        const bodyText =
          lang === 'bikol'
            ? `[DRRMO Synthesis • BDRRM Plan] Pagsiyasat para sa ${selectedBarangay.name} (${hh.toLocaleString()} pamilya, MVI ${mvi} • ${currentTier.tier}). Sa irarom kan RA 10121, pwedeng gamiton kan barangay an 5% LDRRMF katuwang an City Hall para sa structural roof retrofitting, 24/7 disaster desk, asin Bikol flood warning system.`
            : lang === 'filipino'
            ? `[DRRMO Synthesis • BDRRM Plan] Pagsusuri para sa ${selectedBarangay.name} (${hh.toLocaleString()} pamilya, MVI ${mvi} • ${currentTier.tier}). Sa ilalim ng RA 10121, maaaring ilaan ng barangay ang 5% LDRRMF kasama ang counterpart ng Naga City Hall para sa structural roof retrofitting, 24/7 emergency hotline, at Bikol flood warning system.`
            : `[DRRMO Synthesis • BDRRM Plan] Analyzing ${selectedBarangay.name} (${hh.toLocaleString()} HHs, MVI ${mvi} • ${currentTier.tier}). Under RA 10121, your barangay council can allocate its 5% LDRRMF alongside city counterparts for residential roof reinforcement, 24/7 hotline staffing, and Bikol early warning broadcasts.`;

        reply = {
          id: `agt-${Date.now()}`,
          sender: 'agent',
          text: bodyText,
          statute: 'RA 10121 Sec. 12 (c) (6) & Sec. 21',
          sdg: 'SDG 11.5 • SDG 13.1 Climate Resilience',
          suggestedAction:
            lang === 'bikol'
              ? `Magpasa nin Sangguniang Barangay Resolution na nag-aaprobar kan 2026 BDRRM Plan kan ${selectedBarangay.name}.`
              : lang === 'filipino'
              ? `Magpasa ng Sangguniang Barangay Resolution para aprubahan ang 2026 BDRRM Plan ng ${selectedBarangay.name}.`
              : `Pass a Sangguniang Barangay Resolution adopting the 2026 BDRRM Plan for ${selectedBarangay.name}.`,
          budget: `₱${calcBudget.toLocaleString()}`,
        };
      }
      // 3. WATER & SANITATION
      else if (
        hasWord(
          'water', 'toilet', 'sanitation', 'sewage', 'drainage', 'piping',
          'tubig', 'kasilyas', 'palikuran', 'kubeta', 'poso', 'imbornal', 'kanal', 'gripo', 'inodoro'
        )
      ) {
        const calcBudget = Math.round((250000 + hh * 420) / 10000) * 10000;
        const bodyText =
          lang === 'bikol'
            ? `[CEO Engineering Synthesis] Para sa ${selectedBarangay.name} (${hh.toLocaleString()} pamilya, ${currentTier.shortLabel}), pigmamando kan Seksiyon 17 kan RA 7160 an pagpapatindog nin communal sanitation blocks asin MNWD piped water reticulation tanganing mapundo an paggamit nin daing-linig na palikuran.`
            : lang === 'filipino'
            ? `[CEO Engineering Synthesis] Para sa ${selectedBarangay.name} (${hh.toLocaleString()} pamilya, ${currentTier.shortLabel}), itinatakda ng Seksiyon 17 ng RA 7160 ang pagtatayo ng communal sanitation blocks at MNWD piped water reticulation upang maiwasan ang sakit at matanggal ang unimproved toilets.`
            : `[CEO Engineering Synthesis] For ${selectedBarangay.name} (${hh.toLocaleString()} HHs, ${currentTier.shortLabel}), Section 17 of RA 7160 mandates communal sanitation blocks and MNWD piped water reticulation to reduce commercial refilling dependency and eliminate unimproved toilets.`;

        reply = {
          id: `agt-${Date.now()}`,
          sender: 'agent',
          text: bodyText,
          statute: 'RA 7160 Sec. 17 (b) (1) & PD 1096',
          sdg: 'SDG 6 Clean Water • SDG 9 Infrastructure',
          suggestedAction:
            lang === 'bikol'
              ? `Isumite an engineering endorsement gikan sa ${selectedBarangay.name} paduman sa City Engineer's Office (CEO).`
              : lang === 'filipino'
              ? `Isumite ang Barangay Infrastructure Endorsement mula sa ${selectedBarangay.name} papunta sa City Engineer's Office (CEO).`
              : `Submit engineering endorsement from ${selectedBarangay.name} to the City Engineer's Office (CEO).`,
          budget: `₱${calcBudget.toLocaleString()}`,
        };
      }
      // 4. HEALTH & NUTRITION
      else if (
        hasWord(
          'health', 'food', 'nutrition', 'malnutrition', 'feeding', 'clinic', 'medicine', 'senior', 'elderly', 'bhw', 'outreach',
          'gamot', 'pagkain', 'gutom', 'nutrisyon', 'bakuna', 'bata', 'doktor'
        )
      ) {
        const calcBudget = Math.round((150000 + hh * 140) / 5000) * 5000;
        const bodyText =
          lang === 'bikol'
            ? `[CHO Health Synthesis] Sa ${selectedBarangay.name}, an primary healthcare sa irarom kan RA 11223 nakatutok sa feeding programs, quarterly bacteriological testing sa water stations, asin 100% Senior Citizen healthcare coverage.`
            : lang === 'filipino'
            ? `[CHO Health Synthesis] Sa ${selectedBarangay.name}, ang primary care program sa ilalim ng RA 11223 ay nakatutok sa supplementary feeding, quarterly water station inspection, at 100% Senior Citizen ID and healthcare access.`
            : `[CHO Health Synthesis] In ${selectedBarangay.name}, primary care outreach under RA 11223 prioritizes supplementary feeding, quarterly water refilling station inspections, and 100% Senior Citizen healthcare access.`;

        reply = {
          id: `agt-${Date.now()}`,
          sender: 'agent',
          text: bodyText,
          statute: 'RA 11223 (Universal Health Care Sec. 19)',
          sdg: 'SDG 2 Zero Hunger • SDG 3 Good Health',
          suggestedAction:
            lang === 'bikol'
              ? `I-deploy an Barangay Health Workers (BHWs) para sa profiling asin maghagad nin CHO water test.`
              : lang === 'filipino'
              ? `Ipakalat ang Barangay Health Workers (BHWs) para sa household profiling at mag-request ng CHO water testing.`
              : `Deploy Barangay Health Workers (BHWs) across ${selectedBarangay.name} and request CHO water sampling.`,
          budget: `₱${calcBudget.toLocaleString()}`,
        };
      }
      // 5. YOUTH, LIVELIHOOD & CASH-AID
      else if (
        hasWord(
          'youth', 'livelihood', 'job', 'employment', 'skills', 'tesda', 'cash', 'aid', '4ps',
          'trabaho', 'ayuda', 'hanapbuhay', 'kabataan', 'scholarship', 'tulong'
        )
      ) {
        const calcBudget = Math.round((160000 + hh * 165) / 5000) * 5000;
        const bodyText =
          lang === 'bikol'
            ? `[CSWDO Livelihood Synthesis] Base sa CBMS profile kan ${selectedBarangay.name} (MVI ${mvi} • ${currentTier.tier}), prayoridad an digital financial onboarding (GCash/Maya) sa mga unbanked na pamilya asin TESDA-DOLE skills training para sa out-of-school youth.`
            : lang === 'filipino'
            ? `[CSWDO Livelihood Synthesis] Batay sa CBMS profile ng ${selectedBarangay.name} (MVI ${mvi} • ${currentTier.tier}), prayoridad ang digital cash-aid inclusion (GCash/Maya) para sa unbanked families at TESDA-DOLE skills placement para sa kabataan.`
            : `[CSWDO Livelihood Synthesis] Based on the CBMS profile of ${selectedBarangay.name} (MVI ${mvi} • ${currentTier.tier}), priority interventions include digital cash-aid onboarding (GCash/Maya) for unbanked families and DOLE/TESDA skills placement for NEET youth.`;

        reply = {
          id: `agt-${Date.now()}`,
          sender: 'agent',
          text: bodyText,
          statute: 'RA 11310 (4Ps Sec. 13) & RA 7160 Sec. 287',
          sdg: 'SDG 1 No Poverty • SDG 8 Decent Work',
          suggestedAction:
            lang === 'bikol'
              ? `Makipagtabangan sa CSWDO asin CPDO tanganing maiba an ${selectedBarangay.name} sa 2026 AIP Livelihood Schedule.`
              : lang === 'filipino'
              ? `Makipag-ugnayan sa CSWDO at CPDO upang maisama ang ${selectedBarangay.name} sa 2026 AIP Livelihood Drive.`
              : `Coordinate with CSWDO & CPDO to integrate ${selectedBarangay.name} into the 2026 AIP Livelihood Schedule.`,
          budget: `₱${calcBudget.toLocaleString()}`,
        };
      }
      // 6. GENERAL CIVIC / SDG / STATUTORY / AIP INQUIRY
      else if (
        hasWord(
          'budget', 'aip', 'resolution', 'council', 'ordinance', 'plan', 'sdg', 'audit', 'statutory', 'policy', 'basis', 'draft', 'proposal',
          'pondo', 'plano', 'resolusyon', 'badyet', 'pera', 'gasto'
        )
      ) {
        const calcBudget = Math.round((160000 + hh * 165) / 5000) * 5000;
        const bodyText =
          lang === 'bikol'
            ? `[Local Governance Synthesis] Susog sa CBMS profile kan ${selectedBarangay.name} (${hh.toLocaleString()} pamilya, MVI ${mvi} • ${currentTier.tier}), an barangay council pwedeng mag-realign nin pondo sa irarom kan RA 7160 Section 16 (General Welfare) para sa mga priority infrastructure asin basic services.`
            : lang === 'filipino'
            ? `[Local Governance Synthesis] Alinsunod sa CBMS profile ng ${selectedBarangay.name} (${hh.toLocaleString()} pamilya, MVI ${mvi} • ${currentTier.tier}), maaaring mag-realign ng pondo ang konseho sa ilalim ng RA 7160 Section 16 (General Welfare) para sa priority infrastructure at serbisyo publiko.`
            : `[Local Governance Synthesis] In accordance with the CBMS profile of ${selectedBarangay.name} (${hh.toLocaleString()} HHs, MVI ${mvi} • ${currentTier.tier}), the barangay council may realign allocations under RA 7160 Section 16 (General Welfare Clause) to address localized socio-economic gaps.`;

        reply = {
          id: `agt-${Date.now()}`,
          sender: 'agent',
          text: bodyText,
          statute: 'RA 7160 Sec. 16 & Sec. 287',
          sdg: 'SDG 11 Sustainable Cities • SDG 17 Partnerships',
          suggestedAction:
            lang === 'bikol'
              ? `Magbalangkas nin council resolution para sa 2026 Barangay Annual Investment Program.`
              : lang === 'filipino'
              ? `Bumuo ng council resolution para sa 2026 Barangay Annual Investment Program.`
              : `Draft a council resolution aligning priority allocations with the 2026 Barangay AIP.`,
          budget: `₱${calcBudget.toLocaleString()}`,
        };
      }
      // 7. UNRELATED / OUT-OF-SCOPE QUERIES (NO CARDS)
      else {
        let redirectText = '';
        if (lang === 'bikol') {
          redirectText = `Ako si Banwaan AI, nakatutok sa barangay governance kan Naga City asin pagsiyasat kan datos kan CBMS para sa ${selectedBarangay.name}. Dai ko po masisimbag an mga hapot na bako manongod sa barangay. Pwede kamong maghapot dapit sa baha, patubig, kalusugan, pangkabuhayan, o paggibo nin resolusyon.`;
        } else if (lang === 'filipino') {
          redirectText = `Ako si Banwaan AI, nakalaan para sa pamamahala ng barangay sa Naga City at pagsusuri ng datos ng CBMS para sa ${selectedBarangay.name}. Hindi ko po masasagot ang mga tanong na labas sa lokal na pamamahala. Maaari kayong magtanong ukol sa baha, patubig, kalusugan, pangkabuhayan, o pagbalangkas ng resolusyon.`;
        } else {
          redirectText = `I am Banwaan AI, specifically built for Naga City barangay governance and CBMS analytics in ${selectedBarangay.name}. I cannot assist with topics outside local government planning. Feel free to ask about flood resilience, water utilities, primary health, livelihoods, or council resolutions.`;
        }

        reply = {
          id: `agt-${Date.now()}`,
          sender: 'agent',
          text: redirectText,
        };
      }

      setMessages((prev) => [...prev, reply]);
      setIsLoading(false);
      scrollToLatest();
    }, 300);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
    >
      {/* Header Matching Web Embedded AI Agent Header */}
      <View style={styles.headerSection}>
        <View style={styles.agentIdentityRow}>
          <View style={styles.agentAvatar}>
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.agentNameRow}>
              <Text style={styles.screenTitle}>AI Agent</Text>
              <View style={styles.nagaCbmsBadge}>
                <View style={styles.nagaCbmsDot} />
                <Text style={styles.nagaCbmsText}>NAGA CBMS</Text>
              </View>
            </View>
            <Text style={styles.agentSub}>
              Empirical CBMS Data + SDG Alignment + Statutory Policy Basis
            </Text>
          </View>
          <TouchableOpacity
            style={styles.synthesizeBtn}
            onPress={() => handleSend(`Draft AIP Proposal for ${selectedBarangay.name}`)}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.synthesizeBtnText}>Synthesize Policy</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContentContainer}
        onContentSizeChange={scrollToLatest}
      >
        {messages.map((m) => (
          <View
            key={m.id}
            style={[
              styles.messageRow,
              m.sender === 'user' ? styles.userRow : styles.agentRow,
            ]}
          >
            {m.sender === 'user' ? (
              <View style={styles.userBubble}>
                <Text style={styles.userBubbleText}>{m.text}</Text>
              </View>
            ) : (
              <View style={styles.agentCard}>
                {m.statute && (
                  <View style={styles.synthesisHeaderRow}>
                    <Text style={styles.synthesisHeaderTitle}>
                      LATEST SYNTHESIS & STATUTORY BASIS
                    </Text>
                    <Text style={styles.synthesisTargetTag}>
                      {selectedBarangay.name.toUpperCase()}
                    </Text>
                  </View>
                )}

                <Text style={styles.agentBodyText}>{m.text}</Text>

                {/* Inline Pills Matching Screenshot 2 */}
                {(m.statute || m.sdg) && (
                  <View style={styles.inlinePillsWrap}>
                    {m.statute && (
                      <View style={styles.statuteInlinePill}>
                        <Ionicons name="scale-outline" size={11} color="#05389F" />
                        <Text style={styles.statuteInlineText}>{m.statute}</Text>
                      </View>
                    )}
                    {m.sdg && (
                      <View style={styles.sdgInlinePill}>
                        <Text style={styles.sdgInlineText}>{m.sdg}</Text>
                      </View>
                    )}
                  </View>
                )}

                {(m.budget || m.suggestedAction) && (
                  <View style={styles.actionPromptBox}>
                    <View style={styles.actionTopRow}>
                      <Text style={styles.actionPromptLabel}>RECOMMENDED COUNCIL ACTION</Text>
                      {m.budget && <Text style={styles.budgetBadgeText}>{m.budget}</Text>}
                    </View>
                    {m.suggestedAction && (
                      <Text style={styles.actionPromptText}>{m.suggestedAction}</Text>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        ))}

        {isLoading && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#05389F" />
            <Text style={styles.loadingText}>Synthesizing CBMS metrics & statutory citations...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.composerArea}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScrollContent}
        >
          {PROMPT_CHIPS.map((chip) => (
            <TouchableOpacity
              key={chip}
              style={styles.promptChip}
              onPress={() => handleSend(chip)}
              activeOpacity={0.75}
            >
              <Ionicons name="sparkles-outline" size={12} color="#05389F" style={{ marginRight: 5 }} />
              <Text style={styles.promptChipText}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.chatInput}
            placeholder={`Ask SDG or policy question for ${selectedBarangay.name}...`}
            placeholderTextColor="#94A3B8"
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
            <Text style={styles.sendBtnText}>Ask AI →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  agentIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#05389F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  agentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  screenTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  nagaCbmsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    gap: 4,
  },
  nagaCbmsDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#05389F',
  },
  nagaCbmsText: {
    color: '#05389F',
    fontSize: 9,
    fontWeight: '700',
  },
  agentSub: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '400',
    marginTop: 2,
  },
  synthesizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#05389F',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    marginLeft: 8,
  },
  synthesizeBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  chatScroll: { flex: 1 },
  chatContentContainer: { padding: 16, paddingBottom: 20 },
  messageRow: { marginBottom: 14, maxWidth: '94%' },
  userRow: { alignSelf: 'flex-end' },
  agentRow: { alignSelf: 'flex-start', width: '100%' },
  userBubble: {
    backgroundColor: '#05389F',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderBottomRightRadius: 4,
  },
  userBubbleText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500', lineHeight: 20 },
  agentCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  synthesisHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  synthesisHeaderTitle: {
    color: '#05389F',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  synthesisTargetTag: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
  },
  agentBodyText: {
    color: '#1E293B',
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '400',
  },
  inlinePillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  statuteInlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  statuteInlineText: {
    color: '#05389F',
    fontSize: 11,
    fontWeight: '600',
  },
  sdgInlinePill: {
    backgroundColor: '#FEF9C3',
    borderWidth: 1,
    borderColor: '#FDE047',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  sdgInlineText: {
    color: '#854D0E',
    fontSize: 11,
    fontWeight: '600',
  },
  actionPromptBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionPromptLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  budgetBadgeText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '700',
  },
  actionPromptText: {
    color: '#0F172A',
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 3,
    lineHeight: 18,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignSelf: 'flex-start',
    gap: 8,
  },
  loadingText: { color: '#475569', fontSize: 12, fontWeight: '500' },

  composerArea: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    paddingBottom: 10,
  },
  chipScrollContent: { paddingHorizontal: 12, paddingBottom: 8, gap: 6 },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 6,
  },
  promptChipText: { color: '#334155', fontSize: 11.5, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8 },
  chatInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 13.5,
  },
  sendBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#05389F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#94A3B8' },
  sendBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});