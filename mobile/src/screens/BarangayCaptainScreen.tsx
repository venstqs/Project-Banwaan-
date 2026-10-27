import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useOffline } from '../context/OfflineContext';
import { CATEGORY_FILTERS } from '../data/offlineData';
import { AGENT_ENDPOINT } from '../config/api';
import { macosColors, sfFont } from '../config/macosTheme';

type IntelSubTab = 'overview' | 'next_steps' | 'detected';

export const BarangayCaptainScreen: React.FC = () => {
  const {
    selectedBarangay,
    setSelectedBarangayId,
    allBarangays,
    isOnline,
    mobileRole,
    selectedCategoryFilter,
    handleSelectCategory,
    cycleBarangay,
    calamitySimActive,
    setCalamitySimActive,
    submitReport,
    proposals,
    endorseOrQueueProposal,
    verifyProposal,
  } = useOffline();

  const [intelSubTab, setIntelSubTab] = useState<IntelSubTab>('overview');
  const [requestSent, setRequestSent] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiBrief, setAiBrief] = useState<{
    text: string;
    citation: string;
    sdgs: string[];
    draftTitle: string;
    draftBudget: number;
    draftOffice: string;
  } | null>(null);

  const filteredBarangays = useMemo(() => {
    if (selectedCategoryFilter === 'all') return allBarangays;
    return allBarangays.filter((b) => b.category.id === selectedCategoryFilter);
  }, [allBarangays, selectedCategoryFilter]);

  const barangayProposals = useMemo(() => {
    const matches = proposals.filter(
      (p) =>
        p.barangay.toLowerCase().includes(selectedBarangay.realName.toLowerCase()) ||
        p.barangay.includes(`Brgy ${selectedBarangay.id}`) ||
        p.barangay.includes(`Barangay ${selectedBarangay.id}`)
    );
    return matches.length > 0 ? matches : proposals.slice(0, 3);
  }, [proposals, selectedBarangay]);

  const handleEndorseProgram = async (prog: {
    office: string;
    program: string;
    statute: string;
    sdg: string;
    budget_numeric?: number;
  }) => {
    await submitReport({
      barangayId: selectedBarangay.id,
      barangayName: selectedBarangay.displayName,
      reportType: 'Program Endorsement',
      description: `Barangay Council formally endorses LGU program: ${prog.program} for AIP 2026 inclusion.`,
      latitude: selectedBarangay.center[1],
      longitude: selectedBarangay.center[0],
      reporterRole: 'Barangay Captain',
    });

    await endorseOrQueueProposal({
      barangay: selectedBarangay.displayName,
      office: prog.office,
      title: prog.program,
      problem: `Endorsed by Sangguniang Barangay of ${selectedBarangay.realName} based on 2024 CBMS empirical deficits (MVI ${selectedBarangay.vulnerability_index}).`,
      statute: prog.statute,
      section: 'RA 7160 Sec. 389 & Sec. 17',
      sdgs: [prog.sdg],
      budget: prog.budget_numeric || 350000,
    });

    setRequestSent(prog.program);
    setTimeout(() => setRequestSent(null), 4000);
  };

  const handleQuickSynthesize = async (promptType: 'policy' | 'sdg' | 'aip') => {
    setAiLoading(true);
    const queryMap = {
      policy: `Synthesize an SDG-aligned policy brief and statutory AIP intervention for ${selectedBarangay.displayName} (${selectedBarangay.category.name}) based on its CBMS indicators.`,
      sdg: `Audit ${selectedBarangay.realName} CBMS deficits against the 17 UN SDGs and recommend top statutory priorities.`,
      aip: `Draft a 2026 AIP 20% Local Development Fund project ordinance for ${selectedBarangay.realName} with budget and SDG targets.`,
    };

    if (isOnline) {
      try {
        const res = await fetch(AGENT_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'barangay_captain',
            query: queryMap[promptType],
            barangay_id: selectedBarangay.id,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const draft = data.proposal_draft || data.drafted_proposal || {};
          const basis = data.statutory_basis || draft.statutory_basis || {};
          setAiBrief({
            text: data.ai_synthesis || data.response_text || 'Statutory synthesis complete.',
            citation: basis.law ? `${basis.law} (${basis.section || 'Sec. 17'})` : 'RA 7160 Sec. 17 & RA 10121',
            sdgs: data.sdgs || draft.sdgs || ['SDG 6 Clean Water', 'SDG 11 Sustainable Cities'],
            draftTitle: draft.project_title || draft.title || `Priority AIP Upgrade (${selectedBarangay.realName})`,
            draftBudget: Number(draft.estimated_budget_php || 550000),
            draftOffice: draft.office || draft.target_office || 'CEO',
          });
          setAiLoading(false);
          return;
        }
      } catch {
        // Fallback below
      }
    }

    setTimeout(() => {
      const topProg = selectedBarangay.recommended_programs[0];
      setAiBrief({
        text: `[Empirical CBMS Synthesis — ${selectedBarangay.displayName}] Analyzing ${selectedBarangay.total_households.toLocaleString()} households (${selectedBarangay.total_population.toLocaleString()} residents) in ${selectedBarangay.category.name} with MVI ${selectedBarangay.vulnerability_index}. Priority deficits: ${selectedBarangay.infrastructure_ceo.drinking_refilling_pct}% refilling water reliance, ${selectedBarangay.infrastructure_ceo.unimproved_toilet_pct}% unimproved sanitation (${selectedBarangay.infrastructure_ceo.households_needing_sanitation} HHs), and ${selectedBarangay.drrm.weak_roof_pct}% weak roofing. Recommended Sangguniang Barangay resolution: "${topProg?.program}" under ${topProg?.statute}.`,
        citation: topProg?.statute || 'RA 7160 Sec. 17 & RA 10121 Sec. 12',
        sdgs: [topProg?.sdg || 'SDG 6 Clean Water & SDG 11 Sustainable Cities'],
        draftTitle: topProg?.program || `Communal Water & Drainage Upgrade (${selectedBarangay.realName})`,
        draftBudget: topProg?.budget_numeric || 650000,
        draftOffice: topProg?.office || 'CEO',
      });
      setAiLoading(false);
    }, 450);
  };

  const mvi = selectedBarangay.vulnerability_index;
  const riskBadge =
    mvi >= 70
      ? { label: '🔴 High Risk Level', bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' }
      : mvi >= 50
      ? { label: '🟡 Medium Risk Level', bg: '#fffbeb', text: '#b45309', border: '#fde68a' }
      : { label: '🟢 Low Risk Level', bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* ─────────────────────────────────────────────────────────────
          1. TOP BARANGAY SELECTOR & 5-CATEGORY FILTER DECK
         ───────────────────────────────────────────────────────────── */}
      <View style={styles.whiteCard}>
        {/* 5-Category Filter Bar (Directly matching Web Command Center) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFilterRow}
        >
          {CATEGORY_FILTERS.map((cat) => {
            const isActive = selectedCategoryFilter === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catChip,
                  isActive && { backgroundColor: cat.color, borderColor: cat.color },
                ]}
                onPress={() => handleSelectCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.catChipText, isActive && styles.catChipTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Barangay Header + Step Navigator (< 16 / 27 >) */}
        <View style={styles.headerTopRow}>
          <View style={styles.titleCol}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: `${selectedBarangay.category.color}15`,
                    borderColor: `${selectedBarangay.category.color}40`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: selectedBarangay.category.color },
                  ]}
                >
                  {selectedBarangay.category.icon} {selectedBarangay.category.short}
                </Text>
              </View>

              <View
                style={[
                  styles.riskPill,
                  { backgroundColor: riskBadge.bg, borderColor: riskBadge.border },
                ]}
              >
                <Text style={[styles.riskPillText, { color: riskBadge.text }]}>
                  {riskBadge.label}
                </Text>
              </View>
            </View>

            <Text style={styles.mainTitle}>{selectedBarangay.realName}</Text>
            <Text style={styles.subTitle}>
              Brgy #{selectedBarangay.id} • {selectedBarangay.category.name}
            </Text>
          </View>

          {/* Right: Step Navigator & MVI */}
          <View style={styles.rightHeaderCol}>
            <View style={styles.stepNavBox}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => cycleBarangay('prev')}
                activeOpacity={0.7}
              >
                <Text style={styles.stepBtnText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.stepCounterText}>{selectedBarangay.id} / 27</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => cycleBarangay('next')}
                activeOpacity={0.7}
              >
                <Text style={styles.stepBtnText}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.mviPill}>
              <Text style={styles.mviPillLabel}>EMPIRICAL MVI</Text>
              <Text style={styles.mviPillVal}>{selectedBarangay.vulnerability_index}</Text>
            </View>
          </View>
        </View>

        {/* Horizontal Barangay Pill Scroller */}
        <View style={styles.selectorWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillScroller}
          >
            {filteredBarangays.map((b) => {
              const isSelected = selectedBarangay.id === b.id;
              return (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.pill, isSelected && styles.pillActive]}
                  onPress={() => setSelectedBarangayId(b.id)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                    #{b.id} {b.realName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {requestSent && (
        <View style={styles.toastBanner}>
          <Text style={styles.toastText}>
            ✓ Endorsed "{requestSent}" to Mayor's Executive AIP Sign-Off Queue!
          </Text>
        </View>
      )}

      {/* ═════════════════════════════════════════════════════════════
          PERSONA A: BARANGAY CAPTAIN MODE (COUNCIL & STATUTORY INTEL)
         ═════════════════════════════════════════════════════════════ */}
      {mobileRole === 'barangay_captain' ? (
        <>
          {/* Sub-Tab Switcher matching Web App: Overview | Next Steps & AIP | Detected & SDGs */}
          <View style={styles.subTabBar}>
            {(
              [
                { id: 'overview', label: '📍 Overview & AI' },
                { id: 'next_steps', label: '⚡ Next Steps & AIP' },
                { id: 'detected', label: '🔍 Detected & SDGs' },
              ] as const
            ).map((t) => {
              const active = intelSubTab === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.subTabBtn, active && styles.subTabBtnActive]}
                  onPress={() => setIntelSubTab(t.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.subTabText, active && styles.subTabTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── SUB-TAB 1: OVERVIEW & GROQ POLICY COPILOT ── */}
          {intelSubTab === 'overview' && (
            <View style={styles.sectionStack}>
              <View style={styles.whiteCard}>
                <Text style={styles.catDescText}>{selectedBarangay.category.description}</Text>

                {/* Twin Rounded Stats: Households & Population */}
                <View style={styles.twinStatsRow}>
                  <View style={styles.twinStatBox}>
                    <Text style={styles.twinStatLabel}>HOUSEHOLDS</Text>
                    <Text style={styles.twinStatVal}>
                      {selectedBarangay.total_households.toLocaleString()} HHs
                    </Text>
                  </View>
                  <View style={styles.twinStatBox}>
                    <Text style={styles.twinStatLabel}>POPULATION</Text>
                    <Text style={styles.twinStatVal}>
                      {selectedBarangay.total_population.toLocaleString()} Pop
                    </Text>
                  </View>
                </View>

                {/* 3 Hotspot Indicators */}
                <View style={styles.hotspotsBox}>
                  <View style={styles.hotspotLine}>
                    <Text style={styles.hotspotKey}>Weak Roof Structure (DRRMO):</Text>
                    <Text style={[styles.hotspotVal, { color: '#be123c' }]}>
                      {selectedBarangay.drrm.weak_roof_pct}%
                    </Text>
                  </View>
                  <View style={styles.hotspotLine}>
                    <Text style={styles.hotspotKey}>Refilling Station Dependency (CEO):</Text>
                    <Text style={[styles.hotspotVal, { color: macosColors.appleBlue }]}>
                      {selectedBarangay.infrastructure_ceo.drinking_refilling_pct}%
                    </Text>
                  </View>
                  <View style={styles.hotspotLine}>
                    <Text style={styles.hotspotKey}>Sanitation Deficit (Unimproved):</Text>
                    <Text style={[styles.hotspotVal, { color: '#b45309' }]}>
                      {selectedBarangay.infrastructure_ceo.unimproved_toilet_pct}% (
                      {selectedBarangay.infrastructure_ceo.households_needing_sanitation} HHs)
                    </Text>
                  </View>
                </View>
              </View>

              {/* Embedded Groq SDG & Policy Copilot Card (Matches Web Overview) */}
              <View style={styles.copilotCard}>
                <View style={styles.copilotHeader}>
                  <View style={styles.copilotBrandRow}>
                    <View style={styles.copilotIconCircle}>
                      <Text style={styles.copilotSparkle}>✨</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.copilotTitleRow}>
                        <Text style={styles.copilotTitle}>Groq SDG & Policy Copilot</Text>
                        <View style={styles.liveTag}>
                          <Text style={styles.liveTagText}>LIVE</Text>
                        </View>
                      </View>
                      <Text style={styles.copilotSub}>
                        Grounded in 17 UN SDGs, RA Corpus & CBMS
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.synthBtn}
                    onPress={() => handleQuickSynthesize('policy')}
                    disabled={aiLoading}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.synthBtnText}>
                      {aiLoading ? 'Synthesizing...' : '✨ Synthesize'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Quick Audit Chips */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipRow}
                >
                  <TouchableOpacity
                    style={styles.auditChip}
                    onPress={() => handleQuickSynthesize('sdg')}
                  >
                    <Text style={styles.auditChipText}>
                      🎯 SDG Gap Audit ({selectedBarangay.realName})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.auditChip}
                    onPress={() => handleQuickSynthesize('policy')}
                  >
                    <Text style={styles.auditChipText}>📜 Statutory Policy Basis</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.auditChip}
                    onPress={() => handleQuickSynthesize('aip')}
                  >
                    <Text style={styles.auditChipText}>⚖️ Draft AIP Ordinance</Text>
                  </TouchableOpacity>
                </ScrollView>

                {aiLoading ? (
                  <View style={styles.aiLoadingBox}>
                    <ActivityIndicator size="small" color={macosColors.appleBlue} />
                    <Text style={styles.aiLoadingText}>
                      Synthesizing CBMS deficits & statutory mandates...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.aiResultBox}>
                    <Text style={styles.aiResultHeader}>LATEST POLICY & SDG SYNTHESIS</Text>
                    <Text style={styles.aiResultBody}>
                      {aiBrief
                        ? aiBrief.text
                        : `Empirical synthesis for ${selectedBarangay.displayName}: With ${selectedBarangay.total_households.toLocaleString()} households and MVI ${selectedBarangay.vulnerability_index}, priority council action addresses ${selectedBarangay.top_needs[0]} under ${selectedBarangay.recommended_programs[0]?.statute || 'RA 7160 Sec. 17'}.`}
                    </Text>

                    <View style={styles.aiBadgeWrap}>
                      <View style={styles.lawPill}>
                        <Text style={styles.lawPillText}>
                          ⚖️ {aiBrief?.citation || selectedBarangay.recommended_programs[0]?.statute}
                        </Text>
                      </View>
                      <View style={styles.sdgPill}>
                        <Text style={styles.sdgPillText}>
                          🎯 {aiBrief?.sdgs.join(' • ') || selectedBarangay.recommended_programs[0]?.sdg}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.queueDraftBtn}
                      onPress={() =>
                        handleEndorseProgram({
                          office: aiBrief?.draftOffice || selectedBarangay.recommended_programs[0]?.office || 'CEO',
                          program:
                            aiBrief?.draftTitle ||
                            selectedBarangay.recommended_programs[0]?.program ||
                            `Priority Upgrade (${selectedBarangay.realName})`,
                          statute: aiBrief?.citation || 'RA 7160 Sec. 17',
                          sdg: aiBrief?.sdgs[0] || 'SDG 11 Sustainable Cities',
                          budget_numeric: aiBrief?.draftBudget || 550000,
                        })
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.queueDraftBtnText}>
                        + Endorse & Queue Proposal to Mayor's AIP
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Emergency 911 Direct Call Bar */}
              <View style={styles.emergencyQuickBar}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.emergencyQuickTitle}>
                    🚨 Naga 911 / CDRRMO Central ComCen
                  </Text>
                  <Text style={styles.emergencyQuickSub}>
                    0908-525-3000 • (054) 472-3000 • 24/7 Dispatch
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.call911Btn}
                  onPress={() => Linking.openURL('tel:09085253000').catch(() => {})}
                >
                  <Text style={styles.call911BtnText}>📞 Call 911</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── SUB-TAB 2: NEXT STEPS & MAYOR'S AIP SIGN-OFF QUEUE ── */}
          {intelSubTab === 'next_steps' && (
            <View style={styles.sectionStack}>
              {/* Sunshine Yellow Priority Card */}
              <View style={styles.yellowFeatureCard}>
                <View style={styles.yellowHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.yellowTitle}>
                      Prioritize {selectedBarangay.realName} Intervention
                    </Text>
                    <Text style={styles.yellowSub}>
                      {selectedBarangay.top_needs[0]} • MVI {selectedBarangay.vulnerability_index}% across{' '}
                      {selectedBarangay.total_households.toLocaleString()} households.
                    </Text>
                  </View>
                  <View style={styles.yellowBadge}>
                    <Text style={styles.yellowBadgeText}>• Do first</Text>
                  </View>
                </View>

                <View style={styles.yellowActionRow}>
                  <View style={styles.yellowTag}>
                    <Text style={styles.yellowTagText}>⚖️ RA 7160 Sec 389</Text>
                  </View>
                  <View style={styles.yellowTag}>
                    <Text style={styles.yellowTagText}>📅 AIP 2026</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.yellowButton}
                    onPress={() =>
                      handleEndorseProgram(
                        selectedBarangay.recommended_programs[0] || {
                          office: 'CEO',
                          program: `Communal Upgrade (${selectedBarangay.realName})`,
                          statute: 'RA 7160 Sec 17',
                          sdg: 'SDG 6 & SDG 11',
                          budget_numeric: 450000,
                        }
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.yellowButtonText}>Endorse Now →</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Recommended Statutory Pipeline */}
              <View style={styles.whiteCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recommended Statutory Pipeline</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>RA 7160 / RA 10121</Text>
                  </View>
                </View>

                <View style={styles.programsList}>
                  {selectedBarangay.recommended_programs.map((prog, idx) => (
                    <View key={idx} style={styles.programCard}>
                      <View style={styles.progTop}>
                        <View style={styles.progOfficeBadge}>
                          <Text style={styles.progOfficeText}>{prog.office}</Text>
                        </View>
                        <Text style={styles.progSdg}>{prog.sdg}</Text>
                      </View>

                      <Text style={styles.progTitle}>{prog.program}</Text>
                      <Text style={styles.progStatute}>⚖️ Mandate: {prog.statute}</Text>

                      <View style={styles.progFooter}>
                        <Text style={styles.progBudget}>{prog.estimated_budget}</Text>
                        <TouchableOpacity
                          style={styles.endorseBtn}
                          onPress={() => handleEndorseProgram(prog)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.endorseBtnText}>Endorse to Mayor ↗</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Live Mayor's AIP Sign-Off Queue Status */}
              <View style={styles.whiteCard}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>Mayor's AIP Sign-Off Tracker</Text>
                    <Text style={styles.sectionSub}>
                      Live status of proposals synced with Super Admin Web Command Center
                    </Text>
                  </View>
                  <View style={[styles.countBadge, { backgroundColor: '#edf3fc' }]}>
                    <Text style={[styles.countBadgeText, { color: macosColors.appleBlue }]}>
                      {proposals.length} Total
                    </Text>
                  </View>
                </View>

                <View style={styles.programsList}>
                  {barangayProposals.map((prop) => {
                    const statusStyle =
                      prop.status === 'APPROVED'
                        ? { bg: '#ecfdf5', text: '#047857' }
                        : prop.status === 'FUNDED'
                        ? { bg: '#edf3fc', text: '#05389f' }
                        : prop.status === 'REJECTED'
                        ? { bg: '#fef2f2', text: '#b91c1c' }
                        : { bg: '#fffbeb', text: '#b45309' };

                    return (
                      <View key={prop.id} style={styles.programCard}>
                        <View style={styles.progTop}>
                          <Text style={styles.propMetaText}>
                            {prop.office} • {prop.barangay}
                          </Text>
                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: statusStyle.bg },
                            ]}
                          >
                            <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                              {prop.status}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.progTitle}>{prop.title}</Text>
                        <Text style={styles.progStatute}>
                          ₱{prop.budget.toLocaleString()} • {prop.statute} ({prop.section})
                        </Text>
                        {prop.status === 'PENDING' && (
                          <TouchableOpacity
                            style={styles.verifyActionBtn}
                            onPress={() => verifyProposal(prop.id, 'approve')}
                            activeOpacity={0.75}
                          >
                            <Text style={styles.verifyActionBtnText}>✓ Verify & Endorse to Mayor</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {/* ── SUB-TAB 3: DETECTED DEFICITS, DRRMO RATIONS & 17 UN SDGs ── */}
          {intelSubTab === 'detected' && (
            <View style={styles.sectionStack}>
              {/* 4-Grid Empirical CBMS Deficits */}
              <View style={styles.gridContainer}>
                <View style={styles.gridCard}>
                  <View style={[styles.gridIconCircle, { backgroundColor: '#edf3fc' }]}>
                    <Text style={styles.gridEmoji}>💧</Text>
                  </View>
                  <Text style={[styles.gridVal, { color: macosColors.appleBlue }]}>
                    {selectedBarangay.infrastructure_ceo.drinking_refilling_pct}%
                  </Text>
                  <Text style={styles.gridLabel}>Refilling Reliance</Text>
                  <Text style={styles.gridSub}>
                    {selectedBarangay.infrastructure_ceo.piped_water_pct}% Piped Water
                  </Text>
                </View>

                <View style={styles.gridCard}>
                  <View style={[styles.gridIconCircle, { backgroundColor: '#fffbeb' }]}>
                    <Text style={styles.gridEmoji}>🚽</Text>
                  </View>
                  <Text style={[styles.gridVal, { color: '#b45309' }]}>
                    {selectedBarangay.infrastructure_ceo.households_needing_sanitation} HHs
                  </Text>
                  <Text style={styles.gridLabel}>Sanitation Deficit</Text>
                  <Text style={styles.gridSub}>
                    {selectedBarangay.infrastructure_ceo.unimproved_toilet_pct}% Unimproved
                  </Text>
                </View>

                <View style={styles.gridCard}>
                  <View style={[styles.gridIconCircle, { backgroundColor: '#fef2f2' }]}>
                    <Text style={styles.gridEmoji}>🍲</Text>
                  </View>
                  <Text style={[styles.gridVal, { color: '#be123c' }]}>
                    {selectedBarangay.health_cho.food_insecurity_count} HHs
                  </Text>
                  <Text style={styles.gridLabel}>Food Insecure</Text>
                  <Text style={styles.gridSub}>
                    {selectedBarangay.health_cho.food_insecurity_pct}% of Barangay
                  </Text>
                </View>

                <View style={styles.gridCard}>
                  <View style={[styles.gridIconCircle, { backgroundColor: '#f5f3ff' }]}>
                    <Text style={styles.gridEmoji}>💼</Text>
                  </View>
                  <Text style={[styles.gridVal, { color: '#7c3aed' }]}>
                    {selectedBarangay.social_swo.neet_youth_count} Youth
                  </Text>
                  <Text style={styles.gridLabel}>NEET Youth (15–24)</Text>
                  <Text style={styles.gridSub}>
                    {selectedBarangay.social_swo.unbanked_pct}% Unbanked HHs
                  </Text>
                </View>
              </View>

              {/* DRRMO Disaster Rations & Surge Sizer (Matches Web DRRMO Workbench) */}
              <View style={styles.whiteCard}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>
                      DRRMO Typhoon Rations & Relief Calculator
                    </Text>
                    <Text style={styles.sectionSub}>
                      RA 10121 5% LDRRMF emergency stockpiling for {selectedBarangay.realName}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.surgeBtn,
                      calamitySimActive && styles.surgeBtnActive,
                    ]}
                    onPress={() => setCalamitySimActive(!calamitySimActive)}
                  >
                    <Text
                      style={[
                        styles.surgeBtnText,
                        calamitySimActive && { color: '#ffffff' },
                      ]}
                    >
                      {calamitySimActive ? '🌊 Surge Active' : 'Simulate Surge'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.rationsRow}>
                  <View style={styles.rationBox}>
                    <Text style={styles.rationLabel}>Food Packs</Text>
                    <Text style={styles.rationVal}>
                      {Math.round(
                        selectedBarangay.total_households * (calamitySimActive ? 1.5 : 1)
                      ).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.rationBox}>
                    <Text style={styles.rationLabel}>Water Jugs</Text>
                    <Text style={[styles.rationVal, { color: macosColors.appleBlue }]}>
                      {(selectedBarangay.total_households * 2).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.rationBox}>
                    <Text style={styles.rationLabel}>Fuel Gals</Text>
                    <Text style={[styles.rationVal, { color: '#b45309' }]}>
                      {Math.round(selectedBarangay.total_households * 0.4).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* 17 UN SDG Localization Matrix for Selected Barangay */}
              <View style={styles.whiteCard}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>
                      17 UN SDG Barangay Scorecard
                    </Text>
                    <Text style={styles.sectionSub}>
                      Empirical CBMS localization scores for {selectedBarangay.realName}
                    </Text>
                  </View>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>RA 11315</Text>
                  </View>
                </View>

                <View style={styles.sdgList}>
                  {Object.entries(selectedBarangay.sdg_scores).map(([goal, score]) => {
                    const num = Number(score) || 0;
                    const status =
                      num < 55
                        ? { label: 'CRITICAL GAP', color: '#be123c', bg: '#fef2f2' }
                        : num < 75
                        ? { label: 'PRIORITY', color: '#b45309', bg: '#fffbeb' }
                        : { label: 'ON TRACK', color: '#047857', bg: '#ecfdf5' };
                    return (
                      <View key={goal} style={styles.sdgRow}>
                        <View style={styles.sdgTopRow}>
                          <Text style={styles.sdgGoalText}>{goal}</Text>
                          <View style={[styles.sdgStatusBadge, { backgroundColor: status.bg }]}>
                            <Text style={[styles.sdgStatusText, { color: status.color }]}>
                              {num}/100 • {status.label}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.sdgBarTrack}>
                          <View
                            style={[
                              styles.sdgBarFill,
                              {
                                width: `${Math.min(100, Math.max(10, num))}%`,
                                backgroundColor: status.color,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          )}
        </>
      ) : (
        /* ═════════════════════════════════════════════════════════════
            PERSONA B: CITIZEN / RESIDENT TRANSPARENCY PORTAL MODE
           ═════════════════════════════════════════════════════════════ */
        <View style={styles.sectionStack}>
          {/* RA 10173 Data Privacy & Citizen Transparency Shield */}
          <View style={styles.privacyBannerCard}>
            <View style={styles.privacyBannerRow}>
              <Text style={styles.privacyShieldIcon}>🛡️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.privacyBannerTitle}>
                  RA 10173 Citizen Transparency & Privacy Shield Active
                </Text>
                <Text style={styles.privacyBannerSub}>
                  Household micro-cells (&lt;5 HHs) are anonymized under the Data Privacy Act of 2012. Residents have full access to aggregate barangay progress, AIP budgets, and disaster alerts.
                </Text>
              </View>
            </View>
          </View>

          {/* Citizen Barangay Public Services & Resilience Scorecard */}
          <View style={styles.whiteCard}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  My Barangay Public Scorecard ({selectedBarangay.realName})
                </Text>
                <Text style={styles.sectionSub}>
                  Community well-being & municipal service delivery indicators
                </Text>
              </View>
              <View style={[styles.countBadge, { backgroundColor: '#f0fdfa' }]}>
                <Text style={[styles.countBadgeText, { color: '#0d9488' }]}>Public View</Text>
              </View>
            </View>

            <View style={styles.gridContainer}>
              <View style={styles.gridCard}>
                <View style={[styles.gridIconCircle, { backgroundColor: '#ecfdf5' }]}>
                  <Text style={styles.gridEmoji}>🛡️</Text>
                </View>
                <Text style={[styles.gridVal, { color: '#047857' }]}>
                  {selectedBarangay.drrm.has_written_plan ? 'Adopted' : 'In Progress'}
                </Text>
                <Text style={styles.gridLabel}>BDRRM Safety Plan</Text>
                <Text style={styles.gridSub}>
                  {selectedBarangay.drrm.has_hotline ? '24/7 Hotline Active' : 'Use Naga 911 ComCen'}
                </Text>
              </View>

              <View style={styles.gridCard}>
                <View style={[styles.gridIconCircle, { backgroundColor: '#edf3fc' }]}>
                  <Text style={styles.gridEmoji}>🚰</Text>
                </View>
                <Text style={[styles.gridVal, { color: macosColors.appleBlue }]}>
                  {selectedBarangay.infrastructure_ceo.piped_water_pct}%
                </Text>
                <Text style={styles.gridLabel}>Piped Water Access</Text>
                <Text style={styles.gridSub}>
                  {100 - selectedBarangay.infrastructure_ceo.unimproved_toilet_pct}% Sanitary Toilets
                </Text>
              </View>

              <View style={styles.gridCard}>
                <View style={[styles.gridIconCircle, { backgroundColor: '#fffbeb' }]}>
                  <Text style={styles.gridEmoji}>👵</Text>
                </View>
                <Text style={[styles.gridVal, { color: '#b45309' }]}>
                  {(100 - selectedBarangay.health_cho.seniors_without_id_pct).toFixed(1)}%
                </Text>
                <Text style={styles.gridLabel}>Senior ID Coverage</Text>
                <Text style={styles.gridSub}>
                  {selectedBarangay.health_cho.seniors_count} Senior Citizens
                </Text>
              </View>

              <View style={styles.gridCard}>
                <View style={[styles.gridIconCircle, { backgroundColor: '#f5f3ff' }]}>
                  <Text style={styles.gridEmoji}>📱</Text>
                </View>
                <Text style={[styles.gridVal, { color: '#7c3aed' }]}>
                  {selectedBarangay.social_swo.digital_wallet_pct}%
                </Text>
                <Text style={styles.gridLabel}>Digital Cash-Aid Ready</Text>
                <Text style={styles.gridSub}>GCash / Maya / 4Ps Payout</Text>
              </View>
            </View>
          </View>

          {/* Citizen AIP Budget & Public Projects Tracker */}
          <View style={styles.whiteCard}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Active & Proposed LGU Projects in {selectedBarangay.realName}
                </Text>
                <Text style={styles.sectionSub}>
                  20% Local Development Fund (RA 7160 Sec. 287) public budget transparency
                </Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>FY 2026 AIP</Text>
              </View>
            </View>

            <View style={styles.programsList}>
              {selectedBarangay.recommended_programs.map((prog, idx) => (
                <View key={`rec-${idx}`} style={styles.programCard}>
                  <View style={styles.progTop}>
                    <View style={styles.progOfficeBadge}>
                      <Text style={styles.progOfficeText}>{prog.office} OFFICE</Text>
                    </View>
                    <Text style={styles.progSdg}>{prog.sdg}</Text>
                  </View>
                  <Text style={styles.progTitle}>{prog.program}</Text>
                  <Text style={styles.progStatute}>Legal Mandate: {prog.statute}</Text>
                  <View style={styles.progFooter}>
                    <Text style={styles.progBudget}>Allocated: {prog.estimated_budget}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: '#ecfdf5' }]}>
                      <Text style={[styles.statusBadgeText, { color: '#047857' }]}>
                        PUBLIC PRIORITY
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

              {barangayProposals.map((prop) => (
                <View key={prop.id} style={styles.programCard}>
                  <View style={styles.progTop}>
                    <Text style={styles.propMetaText}>
                      {prop.office} • {prop.barangay}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: '#edf3fc' }]}>
                      <Text style={[styles.statusBadgeText, { color: macosColors.appleBlue }]}>
                        {prop.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.progTitle}>{prop.title}</Text>
                  <Text style={styles.progStatute}>
                    Budget: ₱{prop.budget.toLocaleString()} • {prop.statute}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Community SDG Progress for Citizens */}
          <View style={styles.whiteCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                UN Sustainable Development Goals in {selectedBarangay.realName}
              </Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>17 SDGs</Text>
              </View>
            </View>

            <View style={styles.sdgList}>
              {Object.entries(selectedBarangay.sdg_scores)
                .slice(0, 6)
                .map(([goal, score]) => {
                  const num = Number(score) || 0;
                  return (
                    <View key={goal} style={styles.sdgRow}>
                      <View style={styles.sdgTopRow}>
                        <Text style={styles.sdgGoalText}>{goal}</Text>
                        <Text style={styles.sdgScoreMono}>{num} / 100</Text>
                      </View>
                      <View style={styles.sdgBarTrack}>
                        <View
                          style={[
                            styles.sdgBarFill,
                            {
                              width: `${Math.min(100, Math.max(10, num))}%`,
                              backgroundColor: num >= 70 ? '#10b981' : num >= 55 ? '#05389f' : '#f59e0b',
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
            </View>
          </View>
        </View>
      )}
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
  sectionStack: {
    gap: 12,
  },
  whiteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  categoryFilterRow: {
    gap: 6,
    paddingBottom: 12,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  catChipText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.textSecondary,
  },
  catChipTextActive: {
    color: '#ffffff',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  titleCol: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryPillText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
  },
  riskPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  riskPillText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
  },
  mainTitle: {
    fontFamily: sfFont,
    fontSize: 22,
    fontWeight: '800',
    color: macosColors.textPrimary,
    letterSpacing: -0.4,
  },
  subTitle: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '500',
    color: macosColors.textSecondary,
    marginTop: 2,
  },
  rightHeaderCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  stepNavBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 2,
    gap: 4,
  },
  stepBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontFamily: sfFont,
    fontSize: 13,
    fontWeight: '800',
    color: macosColors.textPrimary,
  },
  stepCounterText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.textSecondary,
    paddingHorizontal: 3,
  },
  mviPill: {
    backgroundColor: '#edf3fc',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: macosColors.appleBlueBorder,
  },
  mviPillLabel: {
    fontFamily: sfFont,
    fontSize: 8,
    fontWeight: '800',
    color: macosColors.appleBlue,
  },
  mviPillVal: {
    fontFamily: sfFont,
    fontSize: 16,
    fontWeight: '800',
    color: macosColors.appleBlue,
  },
  selectorWrapper: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
    marginTop: 10,
  },
  pillScroller: {
    gap: 6,
  },
  pill: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pillActive: {
    backgroundColor: macosColors.appleBlue,
    borderColor: macosColors.appleBlue,
  },
  pillText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '600',
    color: macosColors.textSecondary,
  },
  pillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    padding: 3,
    gap: 3,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 11,
    alignItems: 'center',
  },
  subTabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  subTabText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '600',
    color: macosColors.textSecondary,
  },
  subTabTextActive: {
    color: macosColors.appleBlue,
    fontWeight: '800',
  },
  catDescText: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '500',
    color: macosColors.textSecondary,
    lineHeight: 17,
    marginBottom: 10,
  },
  twinStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  twinStatBox: {
    flex: 1,
    backgroundColor: '#f8f9fc',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  twinStatLabel: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '700',
    color: macosColors.textTertiary,
  },
  twinStatVal: {
    fontFamily: sfFont,
    fontSize: 15,
    fontWeight: '800',
    color: macosColors.textPrimary,
    marginTop: 2,
  },
  hotspotsBox: {
    backgroundColor: '#f8f9fc',
    padding: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  hotspotLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hotspotKey: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '500',
    color: macosColors.textSecondary,
  },
  hotspotVal: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '800',
  },
  copilotCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1.5,
    borderColor: macosColors.appleBlueBorder,
    gap: 10,
  },
  copilotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  copilotBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  copilotIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: macosColors.appleBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copilotSparkle: {
    fontSize: 14,
  },
  copilotTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  copilotTitle: {
    fontFamily: sfFont,
    fontSize: 13,
    fontWeight: '800',
    color: macosColors.textPrimary,
  },
  liveTag: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  liveTagText: {
    fontFamily: sfFont,
    fontSize: 8,
    fontWeight: '800',
    color: '#047857',
  },
  copilotSub: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '500',
    color: macosColors.textSecondary,
  },
  synthBtn: {
    backgroundColor: macosColors.appleBlue,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  synthBtnText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  chipRow: {
    gap: 6,
  },
  auditChip: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  auditChipText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '600',
    color: macosColors.textSecondary,
  },
  aiLoadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  aiLoadingText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '500',
    color: macosColors.textSecondary,
  },
  aiResultBox: {
    backgroundColor: '#f8f9fc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  aiResultHeader: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '800',
    color: macosColors.appleBlue,
    letterSpacing: 0.5,
  },
  aiResultBody: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '400',
    color: macosColors.textPrimary,
    lineHeight: 17,
  },
  aiBadgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  lawPill: {
    backgroundColor: '#edf3fc',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  lawPillText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.appleBlue,
  },
  sdgPill: {
    backgroundColor: '#fef9c3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sdgPillText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: '#854d0e',
  },
  queueDraftBtn: {
    backgroundColor: '#059669',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 2,
  },
  queueDraftBtnText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  emergencyQuickBar: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  emergencyQuickTitle: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '800',
    color: '#7f1d1d',
  },
  emergencyQuickSub: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '600',
    color: '#b91c1c',
    marginTop: 1,
  },
  call911Btn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  call911BtnText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  yellowFeatureCard: {
    backgroundColor: macosColors.nagaGold,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#ca8a04',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  yellowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  yellowTitle: {
    fontFamily: sfFont,
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  yellowSub: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '500',
    color: '#334155',
    marginTop: 2,
  },
  yellowBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  yellowBadgeText: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '800',
    color: '#0f172a',
  },
  yellowActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  yellowTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  yellowTagText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: '#0f172a',
  },
  yellowButton: {
    marginLeft: 'auto',
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  yellowButtonText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: macosColors.cardBorder,
  },
  gridIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  gridEmoji: {
    fontSize: 14,
  },
  gridVal: {
    fontFamily: sfFont,
    fontSize: 16,
    fontWeight: '800',
    color: macosColors.textPrimary,
  },
  gridLabel: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '700',
    color: macosColors.textPrimary,
    marginTop: 2,
  },
  gridSub: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '500',
    color: macosColors.textTertiary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: sfFont,
    fontSize: 14,
    fontWeight: '800',
    color: macosColors.textPrimary,
  },
  sectionSub: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '500',
    color: macosColors.textSecondary,
    marginTop: 1,
  },
  countBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countBadgeText: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '700',
    color: macosColors.textSecondary,
  },
  toastBanner: {
    backgroundColor: macosColors.appleGreenSubtle,
    borderWidth: 1,
    borderColor: macosColors.appleGreenBorder,
    borderRadius: 12,
    padding: 10,
  },
  toastText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '700',
    color: '#065f46',
    textAlign: 'center',
  },
  programsList: {
    gap: 9,
  },
  programCard: {
    backgroundColor: '#f8f9fc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  progTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progOfficeBadge: {
    backgroundColor: macosColors.appleBlueSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: macosColors.appleBlueBorder,
  },
  progOfficeText: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '800',
    color: macosColors.appleBlue,
  },
  progSdg: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '600',
    color: macosColors.appleGreen,
  },
  propMetaText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: macosColors.appleBlue,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '800',
  },
  progTitle: {
    fontFamily: sfFont,
    fontSize: 13,
    fontWeight: '700',
    color: macosColors.textPrimary,
    marginTop: 2,
  },
  progStatute: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '500',
    color: macosColors.textSecondary,
    marginTop: 2,
    marginBottom: 6,
  },
  progFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  },
  progBudget: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '800',
    color: macosColors.appleBlue,
  },
  endorseBtn: {
    backgroundColor: macosColors.appleBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  endorseBtnText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  verifyActionBtn: {
    marginTop: 8,
    backgroundColor: '#05389f',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyActionBtnText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  surgeBtn: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  surgeBtnActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  surgeBtnText: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '700',
    color: '#b91c1c',
  },
  rationsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rationBox: {
    flex: 1,
    backgroundColor: '#fef9c3',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: macosColors.nagaGoldBorder,
  },
  rationLabel: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '700',
    color: '#713f12',
  },
  rationVal: {
    fontFamily: sfFont,
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  sdgList: {
    gap: 8,
  },
  sdgRow: {
    backgroundColor: '#f8f9fc',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 5,
  },
  sdgTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sdgGoalText: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '700',
    color: macosColors.textPrimary,
  },
  sdgScoreMono: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '800',
    color: macosColors.appleBlue,
  },
  sdgStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sdgStatusText: {
    fontFamily: sfFont,
    fontSize: 9,
    fontWeight: '800',
  },
  sdgBarTrack: {
    height: 5,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  sdgBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  privacyBannerCard: {
    backgroundColor: '#f0fdfa',
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  privacyBannerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  privacyShieldIcon: {
    fontSize: 18,
  },
  privacyBannerTitle: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '800',
    color: '#115e59',
  },
  privacyBannerSub: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '500',
    color: '#0f766e',
    marginTop: 2,
    lineHeight: 15,
  },
});
