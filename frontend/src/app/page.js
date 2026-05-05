'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  HeartPulse, LayoutDashboard, Box, Wrench,
  LogOut, Clock, ChevronRight, Circle,
  Activity, Wind, Monitor, Syringe, Stethoscope,
  TrendingUp, AlertTriangle, CheckCircle2, XCircle,
  Thermometer, Droplets, Zap, BarChart3, Calendar,
  ArrowUpRight, ArrowDownRight, CalendarClock, Users,
  UserRound, Phone, MapPin, Mail, Search,
  FileText, DollarSign, Download, Plus, Shield, X, Sun, Moon
} from 'lucide-react';

/* ══════════════ DATA ══════════════ */

const DEVICES = [
  {
    id: 'incubator', name: 'Smart Incubator',
    description: 'Neonatal temperature & humidity monitoring with 3D visualization',
    icon: HeartPulse, href: '/devices/incubator', status: 'online', accent: '#e05555',
    stats: [{ label: 'Temp', value: '36.8°C' }, { label: 'Humidity', value: '62%' }],
    active: true, location: 'NICU — Bay 3', serial: 'INC-2024-0031',
    lastMaintenance: '2026-04-15', nextMaintenance: '2026-07-15',
  },
  {
    id: 'ventilator', name: 'Ventilator',
    description: 'Mechanical ventilation control & respiratory monitoring',
    icon: Wind, href: '/devices/ventilator', status: 'online', accent: '#42a5f5',
    stats: [{ label: 'Mode', value: 'A/C' }, { label: 'Rate', value: '16 BPM' }],
    active: true, location: 'ICU — Room 12', serial: 'VNT-2024-0087',
    lastMaintenance: '2026-03-20', nextMaintenance: '2026-06-20',
  },
  {
    id: 'patient-monitor', name: 'Patient Monitor',
    description: 'Vitals tracking — ECG, SpO₂, blood pressure, heart rate',
    icon: Monitor, href: null, status: 'offline', accent: '#4caf50',
    stats: [{ label: 'HR', value: '—' }, { label: 'SpO₂', value: '—' }],
    active: false, location: 'ICU — Room 8', serial: 'PMN-2024-0142',
    lastMaintenance: '2026-04-01', nextMaintenance: '2026-07-01',
  },
  {
    id: 'infusion-pump', name: 'Infusion Pump',
    description: 'IV fluid delivery management & dosage tracking',
    icon: Syringe, href: null, status: 'offline', accent: '#ffb300',
    stats: [{ label: 'Rate', value: '—' }, { label: 'Vol', value: '—' }],
    active: false, location: 'Ward B — Bed 5', serial: 'INF-2024-0215',
    lastMaintenance: '2026-02-10', nextMaintenance: '2026-05-10',
  },
  {
    id: 'ecg', name: 'ECG Monitor',
    description: '12-lead electrocardiogram with real-time waveform display',
    icon: Activity, href: '/devices/ecg', status: 'online', accent: '#ab47bc',
    stats: [{ label: 'HR', value: '72 BPM' }, { label: 'QT', value: '390 ms' }],
    active: true, location: 'Cardiology — Lab 2', serial: 'ECG-2024-0064',
    lastMaintenance: '2026-04-22', nextMaintenance: '2026-07-22',
  },
  {
    id: 'spo2', name: 'SpO₂ Monitor',
    description: 'Pulse oximetry — continuous SpO₂, perfusion index & pulse rate',
    icon: Stethoscope, href: '/devices/spo2', status: 'online', accent: '#26a69a',
    stats: [{ label: 'SpO₂', value: '97%' }, { label: 'PR', value: '74 BPM' }],
    active: true, location: 'Ward A — Bed 2', serial: 'SPO-2024-0033',
    lastMaintenance: '2026-03-05', nextMaintenance: '2026-06-05',
  },
];

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'equipment', label: 'Equipment', icon: Box },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'schedule', label: 'Schedule', icon: CalendarClock },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'billing', label: 'Billing', icon: DollarSign },
  { id: 'staff', label: 'Staff', icon: Shield },
];

const MAINTENANCE_LOG = [
  { id: 1, device: 'Smart Incubator', type: 'Preventive', date: '2026-04-15', status: 'completed', tech: 'Ahmed Hassan', notes: 'Sensor calibration, filter replacement' },
  { id: 2, device: 'Ventilator', type: 'Corrective', date: '2026-03-20', status: 'completed', tech: 'Sara Ali', notes: 'Pressure valve repair' },
  { id: 3, device: 'Patient Monitor', type: 'Preventive', date: '2026-04-01', status: 'completed', tech: 'Omar Khaled', notes: 'Software update, cable inspection' },
  { id: 4, device: 'Infusion Pump', type: 'Preventive', date: '2026-05-10', status: 'scheduled', tech: 'Ahmed Hassan', notes: 'Flow rate calibration' },
  { id: 5, device: 'Smart Incubator', type: 'Inspection', date: '2026-05-20', status: 'scheduled', tech: 'Sara Ali', notes: 'Quarterly safety inspection' },
  { id: 6, device: 'ECG Monitor', type: 'Corrective', date: '2026-05-02', status: 'in-progress', tech: 'Omar Khaled', notes: 'Lead connector replacement' },
];

const APPOINTMENTS = [
  { id: 1, patient: 'Layla Ibrahim', doctor: 'Dr. Nour Sayed', department: 'Pediatrics', date: '2026-05-05', time: '09:00', status: 'confirmed', type: 'Follow-up' },
  { id: 2, patient: 'Youssef Adel', doctor: 'Dr. Ahmed Farouk', department: 'Neonatology', date: '2026-05-05', time: '09:30', status: 'confirmed', type: 'Consultation' },
  { id: 3, patient: 'Maryam Khaled', doctor: 'Dr. Nour Sayed', department: 'Pediatrics', date: '2026-05-05', time: '10:00', status: 'waiting', type: 'Check-up' },
  { id: 4, patient: 'Omar Tarek', doctor: 'Dr. Sara Mostafa', department: 'Cardiology', date: '2026-05-05', time: '10:30', status: 'confirmed', type: 'Follow-up' },
  { id: 5, patient: 'Hana Mahmoud', doctor: 'Dr. Ahmed Farouk', department: 'Neonatology', date: '2026-05-05', time: '11:00', status: 'cancelled', type: 'Consultation' },
  { id: 6, patient: 'Ali Hassan', doctor: 'Dr. Sara Mostafa', department: 'Cardiology', date: '2026-05-05', time: '11:30', status: 'confirmed', type: 'New Patient' },
  { id: 7, patient: 'Salma Wael', doctor: 'Dr. Nour Sayed', department: 'Pediatrics', date: '2026-05-06', time: '09:00', status: 'confirmed', type: 'Follow-up' },
  { id: 8, patient: 'Kareem Fathi', doctor: 'Dr. Ahmed Farouk', department: 'Neonatology', date: '2026-05-06', time: '10:00', status: 'confirmed', type: 'Check-up' },
];

const DOCTORS = [
  { name: 'Dr. Nour Sayed', specialty: 'Pediatrics', status: 'available', patients: 12, nextSlot: '10:00 AM' },
  { name: 'Dr. Ahmed Farouk', specialty: 'Neonatology', status: 'in-session', patients: 8, nextSlot: '11:30 AM' },
  { name: 'Dr. Sara Mostafa', specialty: 'Cardiology', status: 'available', patients: 15, nextSlot: '10:30 AM' },
  { name: 'Dr. Khaled Youssef', specialty: 'Pulmonology', status: 'off-duty', patients: 6, nextSlot: 'Tomorrow' },
];

const PATIENTS = [
  { id: 'P-001', name: 'Layla Ibrahim', age: '2 days', gender: 'Female', blood: 'A+', room: 'NICU-3', doctor: 'Dr. Nour Sayed', status: 'admitted', admitDate: '2026-05-03', phone: '+20 100 123 4567', diagnosis: 'Premature birth — respiratory monitoring' },
  { id: 'P-002', name: 'Youssef Adel', age: '5 days', gender: 'Male', blood: 'O+', room: 'NICU-1', doctor: 'Dr. Ahmed Farouk', status: 'admitted', admitDate: '2026-04-30', phone: '+20 112 987 6543', diagnosis: 'Neonatal jaundice' },
  { id: 'P-003', name: 'Maryam Khaled', age: '3 months', gender: 'Female', blood: 'B+', room: 'Peds-12', doctor: 'Dr. Nour Sayed', status: 'admitted', admitDate: '2026-05-01', phone: '+20 101 555 4321', diagnosis: 'Bronchiolitis — observation' },
  { id: 'P-004', name: 'Omar Tarek', age: '8 months', gender: 'Male', blood: 'AB-', room: 'Card-8', doctor: 'Dr. Sara Mostafa', status: 'discharged', admitDate: '2026-04-20', phone: '+20 115 222 8765', diagnosis: 'Congenital heart defect — post-op' },
  { id: 'P-005', name: 'Hana Mahmoud', age: '1 day', gender: 'Female', blood: 'O-', room: 'NICU-2', doctor: 'Dr. Ahmed Farouk', status: 'critical', admitDate: '2026-05-04', phone: '+20 106 333 2109', diagnosis: 'Very low birth weight — intensive care' },
  { id: 'P-006', name: 'Ali Hassan', age: '6 months', gender: 'Male', blood: 'A-', room: 'Card-5', doctor: 'Dr. Sara Mostafa', status: 'admitted', admitDate: '2026-05-02', phone: '+20 100 444 7890', diagnosis: 'Arrhythmia evaluation' },
];

/* ══════════════ OVERVIEW VIEW ══════════════ */

function OverviewView({ router }) {
  const kpis = [
    { label: 'Total Devices', value: '6', sub: 'Registered', icon: Box, color: '#42a5f5' },
    { label: 'Online', value: '4', sub: '66.7%', icon: CheckCircle2, color: '#4caf50' },
    { label: 'Alerts', value: '3', sub: 'Active', icon: AlertTriangle, color: '#ffb300' },
    { label: 'Uptime', value: '99.2%', sub: 'This month', icon: TrendingUp, color: '#ab47bc' },
  ];

  return (
    <div className="ov-view">
      {/* KPI Row */}
      <div className="ov-kpi-row">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="ov-kpi">
              <div className="ov-kpi-icon" style={{ color: k.color, background: k.color + '12' }}>
                <Icon size={18} />
              </div>
              <div className="ov-kpi-data">
                <span className="ov-kpi-value">{k.value}</span>
                <span className="ov-kpi-label">{k.label}</span>
              </div>
              <span className="ov-kpi-sub">{k.sub}</span>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="ov-charts-row">
        <div className="ov-chart-card">
          <div className="ov-chart-header">
            <h3>Temperature Trend</h3>
            <span className="ov-chart-badge up"><ArrowUpRight size={12} /> 0.3°C</span>
          </div>
          <div className="ov-chart-body">
            <div className="ov-sparkline">
              {[36.2, 36.5, 36.8, 36.6, 36.9, 37.0, 36.8, 36.7, 36.8].map((v, i) => (
                <div key={i} className="ov-spark-bar" style={{ height: `${((v - 35.5) / 2) * 100}%` }}>
                  <span className="ov-spark-tip">{v}°C</span>
                </div>
              ))}
            </div>
            <div className="ov-chart-labels">
              <span>8h ago</span><span>Now</span>
            </div>
          </div>
        </div>

        <div className="ov-chart-card">
          <div className="ov-chart-header">
            <h3>Humidity Trend</h3>
            <span className="ov-chart-badge down"><ArrowDownRight size={12} /> 2%</span>
          </div>
          <div className="ov-chart-body">
            <div className="ov-sparkline">
              {[65, 64, 63, 62, 61, 62, 63, 62, 62].map((v, i) => (
                <div key={i} className="ov-spark-bar humidity" style={{ height: `${((v - 50) / 20) * 100}%` }}>
                  <span className="ov-spark-tip">{v}%</span>
                </div>
              ))}
            </div>
            <div className="ov-chart-labels">
              <span>8h ago</span><span>Now</span>
            </div>
          </div>
        </div>

        <div className="ov-chart-card">
          <div className="ov-chart-header">
            <h3>Device Status</h3>
          </div>
          <div className="ov-chart-body">
            <div className="ov-donut-row">
              <div className="ov-donut">
                <svg viewBox="0 0 36 36" className="ov-donut-svg">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#1e1e24" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#4caf50" strokeWidth="3" strokeDasharray="66.7, 100" />
                </svg>
                <span className="ov-donut-label">4/6</span>
              </div>
              <div className="ov-donut-legend">
                <div><Circle size={8} fill="#4caf50" stroke="none" /> Online (4)</div>
                <div><Circle size={8} fill="#555" stroke="none" /> Offline (2)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Status */}
      <div className="ov-section">
        <h3 className="ov-section-title">Device Indicators</h3>
        <div className="ov-indicators">
          {DEVICES.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.id}
                className={`ov-indicator ${d.active ? 'active' : ''}`}
                onClick={() => d.href && router.push(d.href)}
                role={d.active ? 'button' : undefined}
              >
                <div className="ov-ind-icon" style={{ color: d.accent }}><Icon size={16} /></div>
                <div className="ov-ind-info">
                  <span className="ov-ind-name">{d.name}</span>
                  <span className="ov-ind-loc">{d.location}</span>
                </div>
                <div className={`ov-ind-status ${d.status}`}>
                  <Circle size={6} fill="currentColor" />
                  {d.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Biomedical Engineering KPIs ── */}
      <div className="ov-section">
        <h3 className="ov-section-title">Biomedical Engineering Indicators</h3>
        <div className="bme-kpi-grid">
          {/* IPM Completion Rate */}
          <div className="bme-kpi-card">
            <div className="bme-kpi-gauge">
              <svg viewBox="0 0 36 36" className="bme-gauge-svg">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="var(--border-subtle)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="var(--status-normal)" strokeWidth="3" strokeDasharray="92, 100" strokeLinecap="round" />
              </svg>
              <span className="bme-gauge-val" style={{ color: 'var(--status-normal)' }}>92%</span>
            </div>
            <div className="bme-kpi-info">
              <span className="bme-kpi-label">IPM Completion Rate</span>
              <span className="bme-kpi-desc">Inspections & Preventive Maintenance completed on schedule</span>
              <div className="bme-kpi-detail">
                <span>55 / 60 tasks completed</span>
                <span className="bme-kpi-target">Target: ≥ 90%</span>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="bme-kpi-card">
            <div className="bme-kpi-gauge">
              <svg viewBox="0 0 36 36" className="bme-gauge-svg">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="var(--border-subtle)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="var(--accent-solid)" strokeWidth="3" strokeDasharray="97.3, 100" strokeLinecap="round" />
              </svg>
              <span className="bme-gauge-val" style={{ color: 'var(--accent-solid)' }}>97.3%</span>
            </div>
            <div className="bme-kpi-info">
              <span className="bme-kpi-label">Equipment Availability</span>
              <span className="bme-kpi-desc">A = Uptime / (Uptime + Downtime) across all registered devices</span>
              <div className="bme-kpi-detail">
                <span>Uptime: 8,518 hrs | Downtime: 238 hrs</span>
                <span className="bme-kpi-target">Target: ≥ 95%</span>
              </div>
            </div>
          </div>

          {/* Failure Rate (λ) */}
          <div className="bme-kpi-card">
            <div className="bme-kpi-gauge">
              <svg viewBox="0 0 36 36" className="bme-gauge-svg">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="var(--border-subtle)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="var(--status-warning)" strokeWidth="3" strokeDasharray="12, 100" strokeLinecap="round" />
              </svg>
              <span className="bme-gauge-val" style={{ color: 'var(--status-warning)' }}>0.012</span>
            </div>
            <div className="bme-kpi-info">
              <span className="bme-kpi-label">Failure Rate (λ)</span>
              <span className="bme-kpi-desc">λ = Number of failures / Total operating hours</span>
              <div className="bme-kpi-detail">
                <span>7 failures / 8,518 hrs = 0.012 failures/hr</span>
                <span className="bme-kpi-target">Target: ≤ 0.02</span>
              </div>
            </div>
          </div>

          {/* MTBF */}
          <div className="bme-kpi-card">
            <div className="bme-kpi-gauge">
              <svg viewBox="0 0 36 36" className="bme-gauge-svg">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="var(--border-subtle)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="var(--teal)" strokeWidth="3" strokeDasharray="83, 100" strokeLinecap="round" />
              </svg>
              <span className="bme-gauge-val" style={{ color: 'var(--teal)', fontSize: '0.55rem' }}>1,217h</span>
            </div>
            <div className="bme-kpi-info">
              <span className="bme-kpi-label">MTBF</span>
              <span className="bme-kpi-desc">Mean Time Between Failures = Total uptime / Number of failures</span>
              <div className="bme-kpi-detail">
                <span>8,518 hrs / 7 failures = 1,216.9 hrs</span>
                <span className="bme-kpi-target">Target: ≥ 1,000 hrs</span>
              </div>
            </div>
          </div>

          {/* Reliability Function R(t) */}
          <div className="bme-kpi-card bme-kpi-wide">
            <div className="bme-kpi-gauge">
              <svg viewBox="0 0 36 36" className="bme-gauge-svg">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="var(--border-subtle)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="var(--status-purple)" strokeWidth="3" strokeDasharray="88.6, 100" strokeLinecap="round" />
              </svg>
              <span className="bme-gauge-val" style={{ color: 'var(--status-purple)' }}>88.6%</span>
            </div>
            <div className="bme-kpi-info">
              <span className="bme-kpi-label">Reliability Function R(t)</span>
              <span className="bme-kpi-desc">R(t) = e<sup>−λt</sup> — Probability of equipment operating without failure over time period t = 720 hrs (30 days)</span>
              <div className="bme-kpi-detail">
                <span>R(720) = e<sup>−0.000165 × 720</sup> = 0.8882 → 88.6% reliability over 30 days</span>
                <span className="bme-kpi-target">Target: ≥ 85%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="ov-section">
        <h3 className="ov-section-title">Recent Alerts</h3>
        <div className="ov-alerts">
          {[
            { id: 1, device: 'Smart Incubator', severity: 'critical', message: 'Temperature exceeded 38.5°C — auto-cooling engaged', time: '2 min ago', icon: HeartPulse, color: '#e05555' },
            { id: 2, device: 'ECG Monitor', severity: 'warning', message: 'Irregular heartbeat pattern detected — Lead II', time: '8 min ago', icon: Activity, color: '#ab47bc' },
            { id: 3, device: 'Patient Monitor', severity: 'warning', message: 'SpO₂ dropped below 92% — Room 8', time: '15 min ago', icon: Monitor, color: '#4caf50' },
            { id: 4, device: 'Ventilator', severity: 'info', message: 'Pressure calibration completed successfully', time: '23 min ago', icon: Wind, color: '#42a5f5' },
            { id: 5, device: 'Infusion Pump', severity: 'critical', message: 'IV fluid volume critically low — Ward B, Bed 5', time: '31 min ago', icon: Syringe, color: '#ffb300' },
            { id: 6, device: 'Smart Incubator', severity: 'info', message: 'Humidity stabilized at 62% — normal range', time: '45 min ago', icon: HeartPulse, color: '#e05555' },
          ].map((alert) => {
            const Icon = alert.icon;
            return (
              <div key={alert.id} className={`ov-alert ov-alert-${alert.severity}`}>
                <div className="ov-alert-icon" style={{ color: alert.color }}>
                  <Icon size={14} />
                </div>
                <div className="ov-alert-body">
                  <div className="ov-alert-top">
                    <span className="ov-alert-device">{alert.device}</span>
                    <span className={`ov-alert-sev ${alert.severity}`}>
                      {alert.severity === 'critical' && <AlertTriangle size={10} />}
                      {alert.severity === 'warning' && <AlertTriangle size={10} />}
                      {alert.severity === 'info' && <CheckCircle2 size={10} />}
                      {alert.severity}
                    </span>
                  </div>
                  <p className="ov-alert-msg">{alert.message}</p>
                </div>
                <span className="ov-alert-time">{alert.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="ov-section">
        <h3 className="ov-section-title">Active Device Sessions</h3>
        <div className="ov-sessions-wrap">
          <table className="mt-table">
            <thead>
              <tr>
                <th>Device</th>
                <th>User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { device: 'Smart Incubator', user: 'Dr. Nour Sayed', role: 'Doctor', action: 'Monitoring vitals', duration: '1h 24m', status: 'active' },
                { device: 'ECG Monitor', user: 'Nurse Fatma Ali', role: 'Nurse', action: 'Recording ECG', duration: '32m', status: 'active' },
                { device: 'Patient Monitor', user: 'Dr. Sara Mostafa', role: 'Doctor', action: 'Reviewing SpO₂ trends', duration: '18m', status: 'active' },
                { device: 'Ventilator', user: 'Tech. Omar Khaled', role: 'Technician', action: 'Calibration check', duration: '45m', status: 'active' },
                { device: 'Smart Incubator', user: 'System Admin', role: 'Admin', action: 'Remote control access', duration: '5m', status: 'active' },
                { device: 'Infusion Pump', user: 'Nurse Heba Said', role: 'Nurse', action: 'Adjusting flow rate', duration: '12m', status: 'idle' },
              ].map((s, i) => (
                <tr key={i}>
                  <td className="mt-device">{s.device}</td>
                  <td>{s.user}</td>
                  <td><span className={`ov-role-badge ${s.role.toLowerCase()}`}>{s.role}</span></td>
                  <td className="ov-session-action">{s.action}</td>
                  <td className="ov-session-duration">{s.duration}</td>
                  <td>
                    <span className={`mt-status-badge ${s.status}`}>
                      <Circle size={6} fill="currentColor" />
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ══════════════ EQUIPMENT VIEW ══════════════ */

function EquipmentView({ router }) {
  return (
    <div className="eq-view">
      <div className="eq-header-row">
        <h3 className="ov-section-title">Equipment Inventory</h3>
        <span className="eq-count">{DEVICES.length} devices</span>
      </div>
      <div className="eq-grid">
        {DEVICES.map((d) => {
          const Icon = d.icon;
          return (
            <button
              key={d.id}
              className={`hub-card ${d.active ? 'active' : 'inactive'}`}
              onClick={() => d.href && router.push(d.href)}
              disabled={!d.active}
            >
              <div className="hub-card-accent" style={{ background: d.accent }} />
              <div className="hub-card-top">
                <div className="hub-card-icon" style={{ color: d.accent }}>
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <div className={`hub-card-status ${d.status}`}>
                  <Circle size={6} fill="currentColor" />
                  {d.status === 'online' ? 'Online' : 'Offline'}
                </div>
              </div>
              <div className="hub-card-body">
                <h3 className="hub-card-name">{d.name}</h3>
                <p className="hub-card-desc">{d.description}</p>
              </div>
              <div className="eq-meta">
                <span>{d.location}</span>
                <span>SN: {d.serial}</span>
              </div>
              <div className="hub-card-stats">
                {d.stats.map((s, i) => (
                  <div key={i} className="hub-card-stat">
                    <span className="hub-stat-label">{s.label}</span>
                    <span className="hub-stat-value">{s.value}</span>
                  </div>
                ))}
              </div>
              {d.active && (
                <div className="hub-card-action">Open Dashboard <ChevronRight size={14} /></div>
              )}
              {!d.active && (
                <div className="hub-card-coming">Coming Soon</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════ MAINTENANCE VIEW ══════════════ */

function MaintenanceView() {
  return (
    <div className="mt-view">
      {/* Summary cards */}
      <div className="mt-summary">
        <div className="mt-sum-card">
          <CheckCircle2 size={18} className="mt-sum-icon completed" />
          <div>
            <span className="mt-sum-value">{MAINTENANCE_LOG.filter(m => m.status === 'completed').length}</span>
            <span className="mt-sum-label">Completed</span>
          </div>
        </div>
        <div className="mt-sum-card">
          <Calendar size={18} className="mt-sum-icon scheduled" />
          <div>
            <span className="mt-sum-value">{MAINTENANCE_LOG.filter(m => m.status === 'scheduled').length}</span>
            <span className="mt-sum-label">Scheduled</span>
          </div>
        </div>
        <div className="mt-sum-card">
          <Wrench size={18} className="mt-sum-icon in-progress" />
          <div>
            <span className="mt-sum-value">{MAINTENANCE_LOG.filter(m => m.status === 'in-progress').length}</span>
            <span className="mt-sum-label">In Progress</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-table-wrap">
        <h3 className="ov-section-title">Maintenance Log</h3>
        <table className="mt-table">
          <thead>
            <tr>
              <th>Device</th>
              <th>Type</th>
              <th>Date</th>
              <th>Technician</th>
              <th>Notes</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {MAINTENANCE_LOG.map((m) => (
              <tr key={m.id}>
                <td className="mt-device">{m.device}</td>
                <td><span className={`mt-type-badge ${m.type.toLowerCase()}`}>{m.type}</span></td>
                <td className="mt-date">{m.date}</td>
                <td>{m.tech}</td>
                <td className="mt-notes">{m.notes}</td>
                <td>
                  <span className={`mt-status-badge ${m.status}`}>
                    {m.status === 'completed' && <CheckCircle2 size={11} />}
                    {m.status === 'scheduled' && <Calendar size={11} />}
                    {m.status === 'in-progress' && <Wrench size={11} />}
                    {m.status.replace('-', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════ SCHEDULE VIEW ══════════════ */

function ScheduleView() {
  const [tab, setTab] = useState('today');
  const todayAppts = APPOINTMENTS.filter(a => a.date === '2026-05-05');
  const tomorrowAppts = APPOINTMENTS.filter(a => a.date === '2026-05-06');
  const shown = tab === 'today' ? todayAppts : tomorrowAppts;

  return (
    <div className="sch-view">
      {/* Doctor cards */}
      <div className="sch-docs">
        {DOCTORS.map((doc) => (
          <div key={doc.name} className="sch-doc-card">
            <div className="sch-doc-avatar">
              {doc.name.split(' ').pop().charAt(0)}
            </div>
            <div className="sch-doc-info">
              <span className="sch-doc-name">{doc.name}</span>
              <span className="sch-doc-spec">{doc.specialty}</span>
            </div>
            <div className="sch-doc-right">
              <span className={`sch-doc-status ${doc.status}`}>
                <Circle size={6} fill="currentColor" />
                {doc.status.replace('-', ' ')}
              </span>
              <span className="sch-doc-next">Next: {doc.nextSlot}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule tabs + table */}
      <div className="sch-table-wrap">
        <div className="sch-table-header">
          <h3 className="ov-section-title" style={{ margin: 0 }}>Appointments</h3>
          <div className="sch-tabs">
            <button className={`sch-tab ${tab === 'today' ? 'active' : ''}`} onClick={() => setTab('today')}>
              Today ({todayAppts.length})
            </button>
            <button className={`sch-tab ${tab === 'tomorrow' ? 'active' : ''}`} onClick={() => setTab('tomorrow')}>
              Tomorrow ({tomorrowAppts.length})
            </button>
          </div>
        </div>

        <table className="mt-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Department</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((a) => (
              <tr key={a.id}>
                <td className="sch-time">{a.time}</td>
                <td className="mt-device">{a.patient}</td>
                <td>{a.doctor}</td>
                <td>{a.department}</td>
                <td><span className="mt-type-badge preventive">{a.type}</span></td>
                <td>
                  <span className={`mt-status-badge ${a.status}`}>
                    {a.status === 'confirmed' && <CheckCircle2 size={11} />}
                    {a.status === 'waiting' && <Clock size={11} />}
                    {a.status === 'cancelled' && <XCircle size={11} />}
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════ PATIENTS VIEW ══════════════ */

function PatientsView() {
  const [patients, setPatients] = useState(PATIENTS);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', age: '', gender: 'Male', blood: 'O+', room: '', doctor: '', diagnosis: '' });
  const [search, setSearch] = useState('');
  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.doctor.toLowerCase().includes(search.toLowerCase())
  );

  const admitted = patients.filter(p => p.status === 'admitted').length;
  const critical = patients.filter(p => p.status === 'critical').length;
  const discharged = patients.filter(p => p.status === 'discharged').length;

  function handleAdd(e) {
    e.preventDefault();
    const newP = { ...form, id: 'P-' + String(patients.length + 1).padStart(3, '0'), status: 'admitted', admitDate: new Date().toISOString().split('T')[0], phone: '-' };
    setPatients([newP, ...patients]);
    setForm({ name: '', age: '', gender: 'Male', blood: 'O+', room: '', doctor: '', diagnosis: '' });
    setShowAdd(false);
  }

  return (
    <div className="pt-view">
      {/* Summary */}
      <div className="pt-summary">
        <div className="mt-sum-card">
          <Users size={18} className="mt-sum-icon" style={{ color: '#42a5f5' }} />
          <div>
            <span className="mt-sum-value">{patients.length}</span>
            <span className="mt-sum-label">Total Patients</span>
          </div>
        </div>
        <div className="mt-sum-card">
          <CheckCircle2 size={18} className="mt-sum-icon completed" />
          <div>
            <span className="mt-sum-value">{admitted}</span>
            <span className="mt-sum-label">Admitted</span>
          </div>
        </div>
        <div className="mt-sum-card">
          <AlertTriangle size={18} className="mt-sum-icon" style={{ color: '#ef5350' }} />
          <div>
            <span className="mt-sum-value">{critical}</span>
            <span className="mt-sum-label">Critical</span>
          </div>
        </div>
        <div className="mt-sum-card">
          <ArrowUpRight size={18} className="mt-sum-icon" style={{ color: '#4caf50' }} />
          <div>
            <span className="mt-sum-value">{discharged}</span>
            <span className="mt-sum-label">Discharged</span>
          </div>
        </div>
      </div>

      {/* Search + table */}
      <div className="pt-table-wrap">
        <div className="pt-table-header">
          <h3 className="ov-section-title" style={{ margin: 0 }}>Patient Records</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="pt-search">
              <Search size={14} className="pt-search-icon" />
              <input type="text" placeholder="Search by name, ID, or doctor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pt-search-input" />
            </div>
            <button className="rpt-csv-btn" onClick={() => setShowAdd(true)}><Plus size={13} /> Add Patient</button>
          </div>
        </div>

        <table className="mt-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Blood</th>
              <th>Room</th>
              <th>Doctor</th>
              <th>Diagnosis</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className="pt-id">{p.id}</td>
                <td className="mt-device">{p.name}</td>
                <td>{p.age}</td>
                <td>{p.gender}</td>
                <td><span className="pt-blood">{p.blood}</span></td>
                <td className="pt-room">{p.room}</td>
                <td>{p.doctor}</td>
                <td className="mt-notes">{p.diagnosis}</td>
                <td>
                  <span className={`mt-status-badge ${p.status}`}>
                    {p.status === 'admitted' && <CheckCircle2 size={11} />}
                    {p.status === 'critical' && <AlertTriangle size={11} />}
                    {p.status === 'discharged' && <ArrowUpRight size={11} />}
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Add New Patient</h3><button className="modal-close" onClick={() => setShowAdd(false)}><X size={16} /></button></div>
            <form onSubmit={handleAdd} className="modal-form">
              <div className="modal-row">
                <label>Full Name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
                <label>Age<input required value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="e.g. 3 months" /></label>
              </div>
              <div className="modal-row">
                <label>Gender<select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}><option>Male</option><option>Female</option></select></label>
                <label>Blood Type<select value={form.blood} onChange={e => setForm({ ...form, blood: e.target.value })}>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <option key={b}>{b}</option>)}</select></label>
              </div>
              <div className="modal-row">
                <label>Room<input required value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} placeholder="e.g. NICU-3" /></label>
                <label>Doctor<input required value={form.doctor} onChange={e => setForm({ ...form, doctor: e.target.value })} placeholder="e.g. Dr. Nour Sayed" /></label>
              </div>
              <label>Diagnosis<input required value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} /></label>
              <div className="modal-actions">
                <button type="button" className="modal-btn-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="modal-btn-submit">Add Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════ CSV EXPORT HELPER ══════════════ */

function exportCSV(filename, headers, rows) {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ══════════════ REPORTS VIEW ══════════════ */

const REPORTS = [
  { id: 'RPT-001', title: 'Patient Admission Summary', type: 'Clinical', date: '2026-05-04', author: 'Dr. Nour Sayed', status: 'ready' },
  { id: 'RPT-002', title: 'Device Utilization Report', type: 'Equipment', date: '2026-05-03', author: 'System', status: 'ready' },
  { id: 'RPT-003', title: 'Monthly Maintenance Log', type: 'Maintenance', date: '2026-05-01', author: 'Ahmed Hassan', status: 'ready' },
  { id: 'RPT-004', title: 'NICU Incident Report', type: 'Clinical', date: '2026-04-28', author: 'Dr. Ahmed Farouk', status: 'ready' },
  { id: 'RPT-005', title: 'Quarterly Equipment Audit', type: 'Equipment', date: '2026-04-15', author: 'Sara Ali', status: 'generating' },
  { id: 'RPT-006', title: 'Staff Shift Coverage Report', type: 'Administrative', date: '2026-04-10', author: 'System', status: 'ready' },
];

function ReportsView() {
  function exportPatients() {
    exportCSV('patient_records.csv',
      ['ID', 'Name', 'Age', 'Gender', 'Blood Type', 'Room', 'Doctor', 'Status', 'Admit Date', 'Diagnosis'],
      PATIENTS.map(p => [p.id, p.name, p.age, p.gender, p.blood, p.room, p.doctor, p.status, p.admitDate, p.diagnosis])
    );
  }

  function exportMaintenance() {
    exportCSV('maintenance_log.csv',
      ['Device', 'Type', 'Date', 'Technician', 'Status', 'Notes'],
      MAINTENANCE_LOG.map(m => [m.device, m.type, m.date, m.tech, m.status, m.notes])
    );
  }

  function exportAppointments() {
    exportCSV('appointments.csv',
      ['Patient', 'Doctor', 'Department', 'Date', 'Time', 'Type', 'Status'],
      APPOINTMENTS.map(a => [a.patient, a.doctor, a.department, a.date, a.time, a.type, a.status])
    );
  }

  return (
    <div className="rpt-view">
      {/* Quick Export */}
      <div className="rpt-exports">
        <h3 className="ov-section-title">Quick Export</h3>
        <div className="rpt-export-row">
          <button className="rpt-export-btn" onClick={exportPatients}>
            <Users size={16} />
            <div>
              <span className="rpt-export-name">Patient Records</span>
              <span className="rpt-export-desc">All patient data as CSV</span>
            </div>
            <Download size={14} />
          </button>
          <button className="rpt-export-btn" onClick={exportMaintenance}>
            <Wrench size={16} />
            <div>
              <span className="rpt-export-name">Maintenance Log</span>
              <span className="rpt-export-desc">Service history as CSV</span>
            </div>
            <Download size={14} />
          </button>
          <button className="rpt-export-btn" onClick={exportAppointments}>
            <CalendarClock size={16} />
            <div>
              <span className="rpt-export-name">Appointments</span>
              <span className="rpt-export-desc">Schedule data as CSV</span>
            </div>
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="pt-table-wrap">
        <h3 className="ov-section-title">Generated Reports</h3>
        <table className="mt-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Title</th>
              <th>Type</th>
              <th>Date</th>
              <th>Author</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {REPORTS.map((r) => (
              <tr key={r.id}>
                <td className="pt-id">{r.id}</td>
                <td className="mt-device">{r.title}</td>
                <td><span className={`mt-type-badge ${r.type.toLowerCase()}`}>{r.type}</span></td>
                <td className="mt-date">{r.date}</td>
                <td>{r.author}</td>
                <td>
                  <span className={`mt-status-badge ${r.status}`}>
                    {r.status === 'ready' && <CheckCircle2 size={11} />}
                    {r.status === 'generating' && <Clock size={11} />}
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════ BILLING VIEW ══════════════ */

const INVOICES = [
  { id: 'INV-2026-001', patient: 'Layla Ibrahim', room: 'NICU-3', admitDate: '2026-05-03', days: 2, roomCharge: 3000, labTests: 1500, medications: 800, procedures: 2500, insurance: 'National Health', coverage: 80, status: 'pending' },
  { id: 'INV-2026-002', patient: 'Youssef Adel', room: 'NICU-1', admitDate: '2026-04-30', days: 5, roomCharge: 7500, labTests: 2200, medications: 1200, procedures: 4000, insurance: 'Private Plus', coverage: 90, status: 'paid' },
  { id: 'INV-2026-003', patient: 'Maryam Khaled', room: 'Peds-12', admitDate: '2026-05-01', days: 4, roomCharge: 4000, labTests: 900, medications: 600, procedures: 0, insurance: 'National Health', coverage: 80, status: 'pending' },
  { id: 'INV-2026-004', patient: 'Omar Tarek', room: 'Card-8', admitDate: '2026-04-20', days: 15, roomCharge: 22500, labTests: 5500, medications: 3800, procedures: 18000, insurance: 'Corporate Care', coverage: 95, status: 'paid' },
  { id: 'INV-2026-005', patient: 'Hana Mahmoud', room: 'NICU-2', admitDate: '2026-05-04', days: 1, roomCharge: 1500, labTests: 2000, medications: 1500, procedures: 3500, insurance: 'National Health', coverage: 80, status: 'pending' },
  { id: 'INV-2026-006', patient: 'Ali Hassan', room: 'Card-5', admitDate: '2026-05-02', days: 3, roomCharge: 4500, labTests: 1800, medications: 950, procedures: 1200, insurance: 'Private Plus', coverage: 90, status: 'overdue' },
];

function BillingView() {
  const totalRevenue = INVOICES.reduce((sum, inv) => sum + inv.roomCharge + inv.labTests + inv.medications + inv.procedures, 0);
  const totalPaid = INVOICES.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.roomCharge + inv.labTests + inv.medications + inv.procedures, 0);
  const totalPending = INVOICES.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((sum, inv) => sum + inv.roomCharge + inv.labTests + inv.medications + inv.procedures, 0);

  function exportBilling() {
    exportCSV('billing_report.csv',
      ['Invoice ID', 'Patient', 'Room', 'Admit Date', 'Days', 'Room Charge', 'Lab Tests', 'Medications', 'Procedures', 'Total', 'Insurance', 'Coverage %', 'Patient Owes', 'Status'],
      INVOICES.map(inv => {
        const total = inv.roomCharge + inv.labTests + inv.medications + inv.procedures;
        const patientOwes = total * (1 - inv.coverage / 100);
        return [inv.id, inv.patient, inv.room, inv.admitDate, inv.days, inv.roomCharge, inv.labTests, inv.medications, inv.procedures, total, inv.insurance, inv.coverage, patientOwes.toFixed(0), inv.status];
      })
    );
  }

  return (
    <div className="bill-view">
      {/* KPIs */}
      <div className="pt-summary">
        <div className="mt-sum-card">
          <DollarSign size={18} className="mt-sum-icon" style={{ color: '#42a5f5' }} />
          <div>
            <span className="mt-sum-value">EGP {(totalRevenue / 1000).toFixed(1)}k</span>
            <span className="mt-sum-label">Total Revenue</span>
          </div>
        </div>
        <div className="mt-sum-card">
          <CheckCircle2 size={18} className="mt-sum-icon completed" />
          <div>
            <span className="mt-sum-value">EGP {(totalPaid / 1000).toFixed(1)}k</span>
            <span className="mt-sum-label">Collected</span>
          </div>
        </div>
        <div className="mt-sum-card">
          <Clock size={18} className="mt-sum-icon scheduled" />
          <div>
            <span className="mt-sum-value">EGP {(totalPending / 1000).toFixed(1)}k</span>
            <span className="mt-sum-label">Outstanding</span>
          </div>
        </div>
        <div className="mt-sum-card">
          <FileText size={18} className="mt-sum-icon" style={{ color: '#ab47bc' }} />
          <div>
            <span className="mt-sum-value">{INVOICES.length}</span>
            <span className="mt-sum-label">Invoices</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="pt-table-wrap">
        <div className="pt-table-header">
          <h3 className="ov-section-title" style={{ margin: 0 }}>Invoices</h3>
          <button className="rpt-csv-btn" onClick={exportBilling}>
            <Download size={13} />
            Export CSV
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="mt-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Patient</th>
                <th>Room</th>
                <th>Days</th>
                <th>Room</th>
                <th>Labs</th>
                <th>Meds</th>
                <th>Procedures</th>
                <th>Total</th>
                <th>Insurance</th>
                <th>Patient Owes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv) => {
                const total = inv.roomCharge + inv.labTests + inv.medications + inv.procedures;
                const patientOwes = total * (1 - inv.coverage / 100);
                return (
                  <tr key={inv.id}>
                    <td className="pt-id">{inv.id}</td>
                    <td className="mt-device">{inv.patient}</td>
                    <td className="pt-room">{inv.room}</td>
                    <td>{inv.days}</td>
                    <td className="bill-amount">{inv.roomCharge.toLocaleString()}</td>
                    <td className="bill-amount">{inv.labTests.toLocaleString()}</td>
                    <td className="bill-amount">{inv.medications.toLocaleString()}</td>
                    <td className="bill-amount">{inv.procedures.toLocaleString()}</td>
                    <td className="bill-total">{total.toLocaleString()}</td>
                    <td><span className="bill-insurance">{inv.insurance}</span></td>
                    <td className="bill-owes">{patientOwes.toLocaleString()}</td>
                    <td>
                      <span className={`mt-status-badge ${inv.status}`}>
                        {inv.status === 'paid' && <CheckCircle2 size={11} />}
                        {inv.status === 'pending' && <Clock size={11} />}
                        {inv.status === 'overdue' && <AlertTriangle size={11} />}
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


/* ══════════════ STAFF VIEW ══════════════ */

const INIT_STAFF = [
  { id: 'U-001', name: 'Dr. Nour Sayed', email: 'nour@hospital.com', role: 'doctor', department: 'Pediatrics', status: 'active', joined: '2024-03-15' },
  { id: 'U-002', name: 'Dr. Ahmed Farouk', email: 'ahmed.f@hospital.com', role: 'doctor', department: 'Neonatology', status: 'active', joined: '2023-11-01' },
  { id: 'U-003', name: 'Dr. Sara Mostafa', email: 'sara.m@hospital.com', role: 'doctor', department: 'Cardiology', status: 'active', joined: '2024-06-20' },
  { id: 'U-004', name: 'Nurse Fatma Ali', email: 'fatma@hospital.com', role: 'nurse', department: 'NICU', status: 'active', joined: '2024-01-10' },
  { id: 'U-005', name: 'Nurse Heba Said', email: 'heba@hospital.com', role: 'nurse', department: 'ICU', status: 'active', joined: '2024-08-05' },
  { id: 'U-006', name: 'Ahmed Hassan', email: 'ahmed.h@hospital.com', role: 'technician', department: 'Biomedical Eng.', status: 'active', joined: '2023-09-12' },
  { id: 'U-007', name: 'Omar Khaled', email: 'omar.k@hospital.com', role: 'technician', department: 'Biomedical Eng.', status: 'active', joined: '2024-04-22' },
  { id: 'U-008', name: 'System Admin', email: 'admin@hospital.com', role: 'admin', department: 'IT', status: 'active', joined: '2023-01-01' },
];

function StaffView() {
  const [staff, setStaff] = useState(INIT_STAFF);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'nurse', department: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();

  const byRole = (r) => staff.filter(s => s.role === r).length;

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ email: form.email, password: form.password, fullName: form.name, role: form.role }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Registration failed');
      }
      const data = await res.json();
      const newUser = { id: data.id || ('U-' + String(staff.length + 1).padStart(3, '0')), name: form.name, email: form.email, role: form.role, department: form.department, status: 'active', joined: new Date().toISOString().split('T')[0] };
      setStaff([...staff, newUser]);
      setForm({ name: '', email: '', password: '', role: 'nurse', department: '' });
      setShowAdd(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pt-view">
      <div className="pt-summary">
        <div className="mt-sum-card"><Shield size={18} className="mt-sum-icon" style={{ color: '#42a5f5' }} /><div><span className="mt-sum-value">{staff.length}</span><span className="mt-sum-label">Total Staff</span></div></div>
        <div className="mt-sum-card"><Stethoscope size={18} className="mt-sum-icon" style={{ color: '#42a5f5' }} /><div><span className="mt-sum-value">{byRole('doctor')}</span><span className="mt-sum-label">Doctors</span></div></div>
        <div className="mt-sum-card"><HeartPulse size={18} className="mt-sum-icon" style={{ color: '#4caf50' }} /><div><span className="mt-sum-value">{byRole('nurse')}</span><span className="mt-sum-label">Nurses</span></div></div>
        <div className="mt-sum-card"><Wrench size={18} className="mt-sum-icon" style={{ color: '#ffb300' }} /><div><span className="mt-sum-value">{byRole('technician')}</span><span className="mt-sum-label">Technicians</span></div></div>
      </div>

      <div className="pt-table-wrap">
        <div className="pt-table-header">
          <h3 className="ov-section-title" style={{ margin: 0 }}>Staff Directory</h3>
          <button className="rpt-csv-btn" onClick={() => setShowAdd(true)}><Plus size={13} /> Add User</button>
        </div>
        <table className="mt-table">
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Joined</th><th>Status</th></tr></thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.id}>
                <td className="pt-id">{s.id}</td>
                <td className="mt-device">{s.name}</td>
                <td style={{ color: '#888' }}>{s.email}</td>
                <td><span className={"ov-role-badge " + s.role}>{s.role}</span></td>
                <td>{s.department}</td>
                <td className="mt-date">{s.joined}</td>
                <td><span className={"mt-status-badge " + s.status}><Circle size={6} fill="currentColor" />{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Add New User</h3><button className="modal-close" onClick={() => setShowAdd(false)}><X size={16} /></button></div>
            <form onSubmit={handleAdd} className="modal-form">
              <div className="modal-row">
                <label>Full Name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
                <label>Email<input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
              </div>
              <div className="modal-row">
                <label>Password<input required type="password" minLength={4} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 4 characters" /></label>
                <label>Role
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="nurse">Nurse</option>
                    <option value="doctor">Doctor</option>
                    <option value="technician">Technician</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <label>Department<input required value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="e.g. NICU" /></label>
              </div>
              {error && <div className="modal-error">{error}</div>}
              <div className="modal-actions">
                <button type="button" className="modal-btn-cancel" onClick={() => { setShowAdd(false); setError(''); }}>Cancel</button>
                <button type="submit" className="modal-btn-submit" disabled={saving}>{saving ? 'Creating...' : 'Add User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════ MAIN PAGE ══════════════ */

export default function HomePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [view, setView] = useState('overview');
  const [currentTime, setCurrentTime] = useState('');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const update = () => setCurrentTime(new Date().toLocaleTimeString());
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('his_theme') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('his_theme', next);
  }

  if (loading || !user) return null;

  return (
    <div className="his-layout">
      {/* ── Sidebar ── */}
      <aside className="his-sidebar">
        <div className="his-sb-top">
          <div className="his-sb-logo">
            <HeartPulse size={20} strokeWidth={2.5} />
          </div>
          <div className="his-sb-brand">
            <span className="his-sb-name">HIS</span>
            <span className="his-sb-sub">Team #6</span>
          </div>
        </div>

        <nav className="his-sb-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`his-sb-item ${view === item.id ? 'active' : ''}`}
                onClick={() => setView(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="his-sb-bottom">
          <div className="his-sb-user">
            <div className="his-sb-avatar">
              {user.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="his-sb-user-info">
              <span className="his-sb-user-name">{user.fullName}</span>
              <span className="his-sb-user-role">{user.role}</span>
            </div>
          </div>
          <button className="his-sb-logout" onClick={logout} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="his-main">
        <header className="his-topbar">
          <h2 className="his-topbar-title">
            {NAV_ITEMS.find(n => n.id === view)?.label}
          </h2>
          <div className="his-topbar-right">
            <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <div className="his-topbar-time">
              <Clock size={13} />
              {currentTime}
            </div>
          </div>
        </header>

        <div className="his-content">
          {view === 'overview' && <OverviewView router={router} />}
          {view === 'equipment' && <EquipmentView router={router} />}
          {view === 'maintenance' && <MaintenanceView />}
          {view === 'schedule' && <ScheduleView />}
          {view === 'patients' && <PatientsView />}
          {view === 'reports' && <ReportsView />}
          {view === 'billing' && <BillingView />}
          {view === 'staff' && <StaffView />}
        </div>
      </main>
    </div>
  );
}
