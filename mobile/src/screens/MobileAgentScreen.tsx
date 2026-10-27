import React, { useState, useRef, useEffect } from 'react';
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
import { getMviTier, parseSdgBadges } from './BarangayCaptainScreen';

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

// Strictly scoped to the 5 sample barangays in the mobile app (Barangays 1, 3, 7, 9, 16)
// All values verified 1:1 against Anonymized-Data_Team-Synapse (1).xlsx
interface SampleBarangayCbms {
  hh: number;
  pop: number;
  refillHh: number;
  refillPct: number;
  wellHh: number;
  nonBasicToiHh: number;
  nonBasicToiPct: number;
  openDefecationHh: number;
  foodWorriedHh: number;
  foodWorriedPct: number;
  foodHungryHh: number;
  unbankedHh: number;
  unbankedPct: number;
  neetCount: number;
  neetPct: number;
  hotline: number;
  drrmPlan: number;
  weakRoofHh: number;
  weakRoofPct: number;
  senNoId: number;
  senNoIdPct: number;
  noElecHh: number;
}

const SAMPLE_CBMS_DATA: Record<string, SampleBarangayCbms> = {
  '1': {
    hh: 1065, pop: 4478,
    refillHh: 462, refillPct: 43.4, wellHh: 3,
    nonBasicToiHh: 316, nonBasicToiPct: 29.7, openDefecationHh: 1,
    foodWorriedHh: 322, foodWorriedPct: 30.2, foodHungryHh: 50,
    unbankedHh: 356, unbankedPct: 33.4,
    neetCount: 137, neetPct: 14.8,
    hotline: 1, drrmPlan: 1, weakRoofHh: 21, weakRoofPct: 2.0,
    senNoId: 46, senNoIdPct: 10.3, noElecHh: 17,
  },
  '3': {
    hh: 1508, pop: 5916,
    refillHh: 877, refillPct: 58.2, wellHh: 9,
    nonBasicToiHh: 273, nonBasicToiPct: 18.1, openDefecationHh: 1,
    foodWorriedHh: 384, foodWorriedPct: 25.5, foodHungryHh: 175,
    unbankedHh: 376, unbankedPct: 24.9,
    neetCount: 187, neetPct: 15.1,
    hotline: 0, drrmPlan: 0, weakRoofHh: 133, weakRoofPct: 8.8,
    senNoId: 73, senNoIdPct: 9.9, noElecHh: 25,
  },
  '7': {
    hh: 1845, pop: 7491,
    refillHh: 456, refillPct: 24.7, wellHh: 487,
    nonBasicToiHh: 643, nonBasicToiPct: 34.9, openDefecationHh: 39,
    foodWorriedHh: 910, foodWorriedPct: 49.3, foodHungryHh: 155,
    unbankedHh: 698, unbankedPct: 37.8,
    neetCount: 270, neetPct: 18.1,
    hotline: 0, drrmPlan: 1, weakRoofHh: 245, weakRoofPct: 13.3,
    senNoId: 146, senNoIdPct: 19.8, noElecHh: 105,
  },
  '9': {
    hh: 5706, pop: 23171,
    refillHh: 1935, refillPct: 33.9, wellHh: 14,
    nonBasicToiHh: 1900, nonBasicToiPct: 33.3, openDefecationHh: 7,
    foodWorriedHh: 2336, foodWorriedPct: 40.9, foodHungryHh: 498,
    unbankedHh: 1311, unbankedPct: 23.0,
    neetCount: 680, neetPct: 14.9,
    hotline: 1, drrmPlan: 1, weakRoofHh: 126, weakRoofPct: 2.2,
    senNoId: 269, senNoIdPct: 11.7, noElecHh: 127,
  },
  '16': {
    hh: 1779, pop: 7958,
    refillHh: 518, refillPct: 29.1, wellHh: 9,
    nonBasicToiHh: 629, nonBasicToiPct: 35.4, openDefecationHh: 4,
    foodWorriedHh: 1459, foodWorriedPct: 82.0, foodHungryHh: 751,
    unbankedHh: 853, unbankedPct: 47.9,
    neetCount: 339, neetPct: 20.0,
    hotline: 0, drrmPlan: 1, weakRoofHh: 32, weakRoofPct: 1.8,
    senNoId: 110, senNoIdPct: 16.9, noElecHh: 75,
  },
};

const PROMPT_CHIPS = [
  'Barangay Needs',
  'Water & Sanitation',
  'Food & Health',
  'DRRM & Roofs',
  'Youth & Unbanked',
];

export const MobileAgentScreen: React.FC = () => {
  const { selectedBarangay, isOnline } = useOffline();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<any>(null);

  const currentTier = getMviTier(selectedBarangay.vulnerability_index);
  // Extract numeric ID whether selectedBarangay.id is "16", "brgy-16", or 16
  const cleanId = String(selectedBarangay.id).replace(/[^0-9]/g, '') || '16';
  const cbms = SAMPLE_CBMS_DATA[cleanId] || SAMPLE_CBMS_DATA['16'];
  const primaryProg = selectedBarangay.recommended_programs?.[0];

  const getInitialMessage = (): AgentMessage => ({
    id: `init-${selectedBarangay.id}`,
    sender: 'agent',
    text: `Statutory & CBMS Decision Engine is online for ${selectedBarangay.name} (${selectedBarangay.total_households.toLocaleString()} households, ${selectedBarangay.total_population.toLocaleString()} residents, Empirical MVI ${selectedBarangay.vulnerability_index} • ${currentTier.shortLabel}).\n\nTop Verified CBMS Deficits:\n• ${selectedBarangay.top_needs.join('\n• ')}\n\nAsk about specific barangay needs, water & sanitation, DRRM, health, or livelihoods in English, Filipino, or Bikol.`,
    statute: primaryProg ? primaryProg.statute : 'RA 7160 Sec. 17 & RA 10121 Sec. 12',
    sdg: primaryProg ? parseSdgBadges(primaryProg.sdg).join(' • ') : 'SDG 11 • SDG 17',
    suggestedAction: primaryProg ? `${primaryProg.office}: ${primaryProg.program}` : undefined,
    budget: primaryProg ? primaryProg.estimated_budget : undefined,
  });

  const [messages, setMessages] = useState<AgentMessage[]>([getInitialMessage()]);

  // Refresh AI context automatically whenever the user switches among the 5 sample barangays
  useEffect(() => {
    setMessages([getInitialMessage()]);
  }, [selectedBarangay.id]);

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
            sdg: p.sdgs.map((s: string) => parseSdgBadges(s).join(' • ')).join(' • '),
            suggestedAction: p.suggested_actions.join(' • '),
            budget: `₱${Number(p.estimated_budget_php || 250000).toLocaleString()}`,
          },
        ]);
        setIsLoading(false);
        scrollToLatest();
        return;
      } catch {
        // Fallback to local CBMS synthesis
      }
    }

    setTimeout(() => {
      let reply: AgentMessage;
      const lang = detectLanguage(activeQuery);
      const lower = activeQuery.toLowerCase().trim();
      const bName = selectedBarangay.name;
      const programs = selectedBarangay.recommended_programs || [];

      const hasWord = (...words: string[]) =>
        words.some((w) => new RegExp(`\\b${w}\\b`, 'i').test(lower));

      // Helper to find a matching program from selectedBarangay.recommended_programs
      const findProgramByKeywords = (...keywords: string[]) =>
        programs.find((p) =>
          keywords.some(
            (k) =>
              p.program.toLowerCase().includes(k) ||
              p.office.toLowerCase().includes(k) ||
              p.statute.toLowerCase().includes(k)
          )
        ) || programs[0];

      // 1. GREETING INTENT (NO CARDS)
      const isGreeting = hasWord(
        'hi', 'hello', 'hey', 'sup', 'yo', 'good morning', 'good afternoon', 'good evening',
        'kumusta', 'kamusta', 'musta', 'magandang araw', 'magandang umaga', 'magandang hapon', 'magandang gabi',
        'marhay na aldaw', 'marhay na aga', 'marhay na hapon', 'marhay na banggi', 'dios marhay',
        'salamat', 'thanks', 'thank you', 'mabalos'
      );

      if (isGreeting) {
        const greetingText =
          lang === 'bikol'
            ? `Marhay na aldaw po, Kapitan! Andam akong magtabang sa pagsiyasat kan CBMS data kan ${bName} (halimbawa: ${selectedBarangay.top_needs[0]}). Ano po an satuyang pag-oolayan ngunyan?`
            : lang === 'filipino'
            ? `Magandang araw po, Kapitan! Handa akong tumulong sa pagsusuri ng CBMS data ng ${bName} (halimbawa: ${selectedBarangay.top_needs[0]}). Saang aspeto po natin nais magsimula?`
            : `Kumusta, Kapitan! I am ready to analyze the verified CBMS telemetry for ${bName} (such as: ${selectedBarangay.top_needs[0]}). Which priority area would you like to review?`;

        reply = { id: `agt-${Date.now()}`, sender: 'agent', text: greetingText };
      }

      // 2. SPECIFIC BARANGAY NEEDS / OVERVIEW / SDG AUDIT / AIP PROPOSAL
      else if (
        hasWord(
          'need', 'needs', 'priority', 'deficit', 'deficits', 'problem', 'problems',
          'overview', 'status', 'profile', 'summary', 'sdg', 'audit', 'aip', 'proposal', 'draft',
          'pangangailangan', 'problema', 'kalagayan', 'kaipuhan'
        )
      ) {
        const progList = programs
          .map((p) => `• [${p.office}] ${p.program} (${p.estimated_budget})`)
          .join('\n');

        let specificNarrative = '';
        if (cleanId === '1') {
          specificNarrative = `${bName} is a dense Poblacion barangay (${cbms.hh.toLocaleString()} HHs) where the primary pressures are financial exclusion (${cbms.unbankedHh} unbanked HHs / ${cbms.unbankedPct}%), ${cbms.neetCount} NEET youth (${cbms.neetPct}%), and ${cbms.refillPct}% reliance on commercial water refilling (${cbms.refillHh} HHs), though it already maintains 100% DRRM plan and hotline compliance.`;
        } else if (cleanId === '3') {
          specificNarrative = `${bName} (${cbms.hh.toLocaleString()} HHs) faces a critical institutional DRRM gap: it is the only barangay in the CBMS dataset with 0 Written DRRM Plan and 0 Emergency Hotline (Table 54), compounded by ${cbms.weakRoofHh} households (${cbms.weakRoofPct}%) with weak roofs and ${cbms.refillPct}% commercial water refilling reliance (${cbms.refillHh} HHs).`;
        } else if (cleanId === '7') {
          specificNarrative = `${bName} (${cbms.hh.toLocaleString()} HHs) exhibits upland structural and WASH vulnerabilities: ${cbms.weakRoofHh} households (${cbms.weakRoofPct}%) have weak roofs, ${cbms.wellHh} households still rely on wells/springs for drinking water, ${cbms.openDefecationHh} households practice open defecation (${cbms.nonBasicToiPct}% non-basic sanitation), and ${cbms.foodWorriedHh} households (${cbms.foodWorriedPct}%) experience food insecurity.`;
        } else if (cleanId === '9') {
          specificNarrative = `${bName} is the largest population hub among the sample barangays (${cbms.hh.toLocaleString()} HHs; ${cbms.pop.toLocaleString()} residents), creating high volume pressures: ${cbms.foodWorriedHh.toLocaleString()} food-insecure households (${cbms.foodWorriedPct}%), ${cbms.refillHh.toLocaleString()} households (${cbms.refillPct}%) dependent on water refilling stations, ${cbms.nonBasicToiHh.toLocaleString()} households (${cbms.nonBasicToiPct}%) with shared/non-basic sanitation, and ${cbms.neetCount} NEET youth.`;
        } else {
          specificNarrative = `${bName} (${cbms.hh.toLocaleString()} HHs) records the highest vulnerability index (MVI ${selectedBarangay.vulnerability_index}), driven by an acute food insecurity outlier (${cbms.foodWorriedHh.toLocaleString()} HHs / ${cbms.foodWorriedPct}% worried about food; ${cbms.foodHungryHh} went hungry), ${cbms.unbankedHh} unbanked households (${cbms.unbankedPct}%), ${cbms.nonBasicToiHh} households (${cbms.nonBasicToiPct}%) lacking basic private sanitation, and no dedicated barangay emergency hotline.`;
        }

        const bodyText =
          lang === 'bikol'
            ? `[CBMS Empirical Audit • ${bName}]\n${specificNarrative}\n\nMga Prayoridad na Kakulangan:\n• ${selectedBarangay.top_needs.join('\n• ')}\n\n2026 AIP Recommended Programs:\n${progList}`
            : lang === 'filipino'
            ? `[CBMS Empirical Audit • ${bName}]\n${specificNarrative}\n\nMga Pangunahing Kakulangan:\n• ${selectedBarangay.top_needs.join('\n• ')}\n\n2026 AIP Recommended Programs:\n${progList}`
            : `[CBMS Empirical Audit • ${bName}]\n${specificNarrative}\n\nVerified Barangay Deficits:\n• ${selectedBarangay.top_needs.join('\n• ')}\n\n2026 AIP Recommended Programs:\n${progList}`;

        reply = {
          id: `agt-${Date.now()}`,
          sender: 'agent',
          text: bodyText,
          statute: primaryProg ? primaryProg.statute : 'RA 7160 Sec. 17',
          sdg: primaryProg ? parseSdgBadges(primaryProg.sdg).join(' • ') : 'SDG 11',
          suggestedAction: primaryProg
            ? `Endorse "${primaryProg.program}" (${primaryProg.office}) in the Barangay tab for 2026 AIP inclusion.`
            : undefined,
          budget: primaryProg ? primaryProg.estimated_budget : undefined,
        };
      }

      // 3. DISASTER, TYPHOON, ROOFS & DRRM (Tailored per sample barangay)
      else if (
        hasWord(
          'disaster', 'typhoon', 'flood', 'flooding', 'storm', 'calamity', 'roof', 'roofs',
          'baha', 'bagyo', 'unos', 'kalamidad', 'drrm', 'bdrrm', 'evacuation', 'bubong', 'uwan', 'uran', 'hotline'
        )
      ) {
        const matchedProg = findProgramByKeywords('drrm', 'flood', 'roof', 'shelter', '10121');
        let drrmDiagnosis = '';
        let actionStep = '';
        let estBudget = matchedProg?.estimated_budget || '₱185,000';

        if (cleanId === '3') {
          drrmDiagnosis = `CBMS Table 54 & Table 50 Alert for ${bName}: Out of all surveyed barangays, ${bName} is the ONLY barangay with 0 Written DRRM Plan and 0 Emergency Hotline, while 133 households (8.8%) occupy structures with weak/unimproved roofing (including 106 asbestos and 19 thatch roofs).`;
          actionStep = `Urgently convene the Barangay Development Council to formulate the written BDRRM Plan, activate a 24/7 hotline, and prioritize the 133 weak-roof households.`;
          estBudget = '₱185,000';
        } else if (cleanId === '7') {
          drrmDiagnosis = `CBMS Table 50 & Table 54 Alert for ${bName}: While ${bName} has a written DRRM plan, it has NO emergency hotline (0%) and records the highest structural roof vulnerability among the sample barangays—245 households (13.3%) have weak/unimproved roofs (200 sod/thatch and 37 wood/bamboo), plus 105 households lack electricity.`;
          actionStep = `Allocate 5% LDRRMF for typhoon roof-tying/GI sheet retrofitting targeting the 245 vulnerable households and establish a dedicated VHF/cellular emergency hotline.`;
          estBudget = matchedProg?.estimated_budget || '₱320,000';
        } else if (cleanId === '16') {
          drrmDiagnosis = `CBMS Table 50 & Table 54 Alert for ${bName}: Situated in the Bicol River flood basin, ${bName} has a written DRRM plan and a low weak-roof rate (32 HHs / 1.8%), but lacks a dedicated Barangay Emergency Hotline (0% in Table 54) and faces severe post-flood food/water disruption affecting 1,459 households.`;
          actionStep = `Activate a 24/7 river-surge warning hotline and pre-position relief stockpiles at the evacuation facility for ${bName}'s 1,779 households.`;
          estBudget = matchedProg?.estimated_budget || '₱250,000';
        } else if (cleanId === '9') {
          drrmDiagnosis = `CBMS Table 50 & Table 54 Status for ${bName}: ${bName} already maintains both a Written DRRM Plan (100%) and an Emergency Hotline (100%). However, due to its large size (5,706 HHs), 126 households (2.2%) still have weak/salvaged roofs and 127 households lack electricity.`;
          actionStep = `Focus LDRRMF on structural retrofitting for the 126 light-roof households and expanding evacuation shelter capacity for ${bName}'s 23,171 residents.`;
          estBudget = matchedProg?.estimated_budget || '₱290,000';
        } else {
          // Barangay 1
          drrmDiagnosis = `CBMS Table 50 & Table 54 Status for ${bName}: ${bName} already has 100% compliance for both its Written DRRM Plan and Emergency Hotline, with only 21 households (2.0%) having light/unimproved roofs. However, 142 households (13.3%) live in overcrowded conditions (Table 19), elevating fire and urban flood-evacuation risks.`;
          actionStep = `Conduct alley clearance, fire-hydrant checks, and targeted roof reinforcement for the 21 unimproved-roof households in ${bName}.`;
          estBudget = matchedProg?.estimated_budget || '₱160,000';
        }

        reply = {
          id: `agt-${Date.now()}`,
          sender: 'agent',
          text: drrmDiagnosis,
          statute: 'RA 10121 Sec. 12 (c) (6) & Sec. 21',
          sdg: 'SDG 11 • SDG 13',
          suggestedAction: actionStep,
          budget: estBudget,
        };
      }

      // 4. WATER & SANITATION (Tailored per sample barangay)
      else if (
        hasWord(
          'water', 'toilet', 'sanitation', 'sewage', 'drainage', 'piping', 'wash',
          'tubig', 'kasilyas', 'palikuran', 'kubeta', 'poso', 'imbornal', 'kanal', 'gripo', 'inodoro', 'refilling'
        )
      ) {
        const matchedProg = findProgramByKeywords('water', 'sanitation', 'toilet', 'pip', 'ceo', '7160');
        let washDiagnosis = '';
        let washAction = '';
        let washBudget = matchedProg?.estimated_budget || '₱750,000';

        if (cleanId === '16') {
          washDiagnosis = `CBMS Table 6 & Table 9 Diagnosis for ${bName}: 518 households (29.1%) depend on commercial water refilling stations and 56 households (3.1%) rely on tanker trucks. For sanitation, 629 households (35.4%) lack basic private sanitation—consisting of 624 households sharing limited facilities, 1 unimproved pit latrine, and 4 households practicing open defecation.`;
          washAction = `Endorse PROP-NAGA-2026-CEO-002 (Piped Water Reticulation Mainline Extension & Communal Sanitation Block) for ${bName}.`;
          washBudget = '₱1,250,000';
        } else if (cleanId === '7') {
          washDiagnosis = `CBMS Table 6 & Table 9 Diagnosis for ${bName}: Severe groundwater & sanitation vulnerability—487 households (26.4%) still draw drinking water from tubed/dug wells and springs (440 borehole, 47 wells, 145 springs), while 643 households (34.9%) lack basic sanitation, including 39 households practicing open defecation (highest among the sample barangays).`;
          washAction = `Prioritize Level III piped water expansion to replace unsafe wells/springs and construct sanitary toilet blocks for the 39 open-defecation households in ${bName}.`;
          washBudget = '₱980,000';
        } else if (cleanId === '3') {
          washDiagnosis = `CBMS Table 6 & Table 9 Diagnosis for ${bName}: Over half of the community—877 out of 1,508 households (58.2%)—relies on commercial water refilling stations because only 39.7% have piped water into their dwellings/yards. Additionally, 273 households (18.1%) lack basic private toilets (247 shared/limited, 25 unimproved, 1 open defecation).`;
          washAction = `Coordinate with MNWD and the City Engineer's Office (CEO) for household piped-water connections and septage upgrades for the 25 unimproved toilet households.`;
          washBudget = '₱680,000';
        } else if (cleanId === '9') {
          washDiagnosis = `CBMS Table 6 & Table 9 Diagnosis for ${bName}: Due to high urban density, 1,935 households (33.9%) rely on water refilling stations and 1,900 households (33.3%) lack basic private sanitation (1,851 shared/limited facilities, 42 unimproved toilets, and 7 open-defecation households).`;
          washAction = `Deploy high-capacity communal septic and multi-household sanitation retrofits across ${bName}'s dense residential zones.`;
          washBudget = '₱1,450,000';
        } else {
          // Barangay 1
          washDiagnosis = `CBMS Table 6 & Table 9 Diagnosis for ${bName}: 462 out of 1,065 households (43.4%) rely on commercial water refilling stations and bottled water, while 316 households (29.7%) lack basic private sanitation (313 in shared/limited multi-family toilets, 2 unimproved, 1 open defecation).`;
          washAction = `Submit a barangay infrastructure endorsement to the CEO for secondary water line tapping and shared-sanitation upgrading in ${bName}.`;
          washBudget = '₱540,000';
        }

        reply = {
          id: `agt-${Date.now()}`,
          sender: 'agent',
          text: washDiagnosis,
          statute: 'RA 7160 Sec. 17 (b) (1) & PD 1096',
          sdg: 'SDG 6 • SDG 9',
          suggestedAction: washAction,
          budget: washBudget,
        };
      }

      // 5. FOOD INSECURITY, HEALTH & SENIORS (Tailored per sample barangay)
      else if (
        hasWord(
          'health', 'food', 'nutrition', 'malnutrition', 'feeding', 'clinic', 'medicine', 'senior', 'elderly', 'bhw', 'outreach', 'hungry', 'hunger',
          'gamot', 'pagkain', 'gutom', 'nutrisyon', 'bakuna', 'bata', 'doktor'
        )
      ) {
        const matchedProg = findProgramByKeywords('health', 'food', 'nutrition', 'cho', '11223');
        let healthDiagnosis = '';
        let healthAction = '';
        let healthBudget = matchedProg?.estimated_budget || '₱280,000';

        if (cleanId === '16') {
          healthDiagnosis = `CBMS Table 21 & Table 27 Alert for ${bName}: Extreme food-insecurity outlier—1,459 out of 1,779 households (82.0%) worried about not having enough food, 744 ran out of food, and 751 went hungry without eating. Additionally, 110 senior citizens (16.9%) lack a Senior Citizen ID.`;
          healthAction = `Execute PROP-NAGA-2026-CHO-003 (Food Insecurity Verification Mission, Supplementary Feeding & Water Bacteriological Testing) and register the 110 seniors.`;
          healthBudget = '₱280,000';
        } else if (cleanId === '7') {
          healthDiagnosis = `CBMS Table 21 & Table 27 Alert for ${bName}: Nearly half of all households—910 out of 1,845 HHs (49.3%)—experienced food insecurity (490 ran out of food; 155 went hungry). ${bName} also has the highest rate of unregistered seniors among the sample barangays, with 146 seniors (19.8%) lacking a Senior Citizen ID.`;
          healthAction = `Deploy CHO mobile nutrition teams for the 490 acute food-deficit households and conduct a barangay-wide OSCA Senior ID registration caravan.`;
          healthBudget = '₱260,000';
        } else if (cleanId === '9') {
          healthDiagnosis = `CBMS Table 21 & Table 27 Alert for ${bName}: By sheer volume, ${bName} has the highest number of food-insecure families in Naga—2,336 households (40.9%) worried about food, 751 ran out of food, and 498 went hungry—alongside 269 senior citizens (11.7%) without a Senior Citizen ID.`;
          healthAction = `Establish zone-level BHW nutrition monitoring posts and partner with CHO & CSWDO for targeted food supplementation across ${bName}.`;
          healthBudget = '₱420,000';
        } else if (cleanId === '3') {
          healthDiagnosis = `CBMS Table 21 & Table 27 Diagnosis for ${bName}: While overall food worry is lower at 25.5% (384 HHs), acute hunger is concentrated: 198 households ran out of food and 175 households went hungry without eating. Additionally, 73 senior citizens (9.9%) lack a Senior Citizen ID.`;
          healthAction = `Target Barangay Health Worker (BHW) home visits specifically to the 175 acute-hunger households and complete OSCA ID enrollment for the 73 seniors.`;
          healthBudget = '₱195,000';
        } else {
          // Barangay 1
          healthDiagnosis = `CBMS Table 21 & Table 27 Diagnosis for ${bName}: 322 households (30.2%) reported food worry and 279 ran out of food, though severe hunger is lower (50 HHs). Meanwhile, 46 out of 448 senior citizens (10.3%) still lack their Senior Citizen ID for statutory healthcare and medicine discounts.`;
          healthAction = `Conduct targeted BHW nutritional screening for the 50 severe-hunger households and assist the 46 unregistered seniors with OSCA ID issuance.`;
          healthBudget = '₱175,000';
        }

        reply = {
          id: `agt-${Date.now()}`,
          sender: 'agent',
          text: healthDiagnosis,
          statute: 'RA 11223 Sec. 19 & RA 9994 (Expanded Senior Citizens Act)',
          sdg: 'SDG 2 • SDG 3',
          suggestedAction: healthAction,
          budget: healthBudget,
        };
      }

      // 6. YOUTH, LIVELIHOOD & FINANCIAL INCLUSION (Tailored per sample barangay)
      else if (
        hasWord(
          'youth', 'livelihood', 'job', 'employment', 'skills', 'tesda', 'cash', 'aid', '4ps', 'unbanked', 'bank', 'neet',
          'trabaho', 'ayuda', 'hanapbuhay', 'kabataan', 'scholarship', 'tulong', 'pondo', 'badyet', 'budget', 'resolution', 'resolusyon'
        )
      ) {
        const matchedProg = findProgramByKeywords('youth', 'neet', 'unbanked', 'cash', 'livelihood', 'swo', '11310');
        let swoDiagnosis = '';
        let swoAction = '';
        let swoBudget = matchedProg?.estimated_budget || '₱340,000';

        if (cleanId === '1') {
          swoDiagnosis = `CBMS Table 22 & Table 41 Diagnosis for ${bName}: 356 out of 1,065 households (33.4%) are completely unbanked (no bank, digital bank, or e-money account), and 137 out of 926 youth aged 15–24 (14.8%) are Not in Education, Employment, or Training (NEET).`;
          swoAction = `Endorse PROP-NAGA-2026-SWO-004 (Digital Cash-Aid Payout Enrollment & NEET Youth Skills Placement) for ${bName}.`;
          swoBudget = '₱340,000';
        } else if (cleanId === '16') {
          swoDiagnosis = `CBMS Table 22 & Table 41 Diagnosis for ${bName}: Nearly half of ${bName}—853 out of 1,779 households (47.9%)—has no formal financial account, blocking digital cash-aid payouts, while 339 out of 1,694 youth (20.0%) are NEET and 75 households lack electricity.`;
          swoAction = `Launch an on-site e-money/digital banking onboarding drive for the 853 unbanked households and enroll the 339 NEET youth in TESDA/PESO livelihood tracks.`;
          swoBudget = '₱410,000';
        } else if (cleanId === '7') {
          swoDiagnosis = `CBMS Table 22 & Table 41 Diagnosis for ${bName}: 698 households (37.8%) are unbanked and 270 out of 1,494 youth (18.1%) are NEET. Additionally, only 55.0% of households rely on clean cooking fuel (Table 56) and 105 households lack electricity.`;
          swoAction = `Partner with CSWDO and DOLE for agro-forestry/TVET youth placement (270 NEET youth) and microfinance/cooperative account onboarding for the 698 unbanked households.`;
          swoBudget = '₱380,000';
        } else if (cleanId === '9') {
          swoDiagnosis = `CBMS Table 22 & Table 41 Diagnosis for ${bName}: Across ${bName}'s 5,706 households, 1,311 families (23.0%) remain unbanked and 680 out of 4,570 youth (14.9%) are NEET—the largest youth cohort among the sample barangays.`;
          swoAction = `Establish a Barangay PESO job-link desk for the 680 NEET youth and coordinate digital financial inclusion caravans for the 1,311 unbanked households.`;
          swoBudget = '₱490,000';
        } else {
          // Barangay 3
          swoDiagnosis = `CBMS Table 22 & Table 41 Diagnosis for ${bName}: 376 out of 1,508 households (24.9%) lack any formal financial or e-money account, and 187 out of 1,235 youth aged 15–24 (15.1%) are NEET.`;
          swoAction = `Coordinate with CSWDO to onboard the 376 unbanked households into digital payout channels and refer the 187 NEET youth to Naga City TVET scholarship slots.`;
          swoBudget = '₱310,000';
        }

        reply = {
          id: `agt-${Date.now()}`,
          sender: 'agent',
          text: swoDiagnosis,
          statute: 'RA 11310 (4Ps Sec. 13) & RA 7160 Sec. 287',
          sdg: 'SDG 1 • SDG 8',
          suggestedAction: swoAction,
          budget: swoBudget,
        };
      }

      // 7. OUT-OF-SCOPE QUERIES (NO CARDS)
      else {
        const redirectText =
          lang === 'bikol'
            ? `Ako si Banwaan AI, nakatutok sa pagsiyasat kan 2024 PSA CBMS data para sa ${bName} (halimbawa: ${selectedBarangay.top_needs[0]}). Pwede kamong maghapot dapit sa mga pangangailangan kan barangay, patubig asin palikuran, DRRM, kalusugan, o hanapbuhay.`
            : lang === 'filipino'
            ? `Ako si Banwaan AI, nakalaan sa pagsusuri ng 2024 PSA CBMS data para sa ${bName} (halimbawa: ${selectedBarangay.top_needs[0]}). Maaari kayong magtanong tungkol sa mga pangangailangan ng barangay, tubig at palikuran, DRRM, kalusugan, o kabuhayan.`
            : `I am Banwaan AI, built to analyze the 2024 PSA CBMS dataset for ${bName} (specifically addressing gaps like: ${selectedBarangay.top_needs[0]}). Ask me about barangay needs, water & sanitation, food & health, DRRM & roofs, or youth & unbanked households.`;

        reply = { id: `agt-${Date.now()}`, sender: 'agent', text: redirectText };
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
              {selectedBarangay.name} • {selectedBarangay.total_households.toLocaleString()} HHs • MVI {selectedBarangay.vulnerability_index}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.synthesizeBtn}
            onPress={() => handleSend(`Barangay Needs`)}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.synthesizeBtnText}>Audit Needs</Text>
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
                      EMPIRICAL CBMS SYNTHESIS & STATUTORY BASIS
                    </Text>
                    <Text style={styles.synthesisTargetTag}>
                      {selectedBarangay.name.toUpperCase()}
                    </Text>
                  </View>
                )}

                <Text style={styles.agentBodyText}>{m.text}</Text>

                {/* Inline Pills */}
                {(m.statute || m.sdg) && (
                  <View style={styles.inlinePillsWrap}>
                    {m.statute && (
                      <View style={styles.statuteInlinePill}>
                        <Ionicons name="scale-outline" size={11} color="#05389F" />
                        <Text style={styles.statuteInlineText}>{m.statute}</Text>
                      </View>
                    )}
                    {m.sdg &&
                      parseSdgBadges(m.sdg).map((badge, bIdx) => (
                        <View key={bIdx} style={styles.sdgInlinePill}>
                          <Text style={styles.sdgInlineText}>{badge}</Text>
                        </View>
                      ))}
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
            <Text style={styles.loadingText}>
              Auditing {selectedBarangay.name} CBMS tables & statutory mandates...
            </Text>
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
            placeholder={`Ask about ${selectedBarangay.name} CBMS needs...`}
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
    fontWeight: '500',
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
    fontWeight: '700',
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