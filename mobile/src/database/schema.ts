import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('banwaan_offline.db');

export const initDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS queued_reports (
      id TEXT PRIMARY KEY,
      barangayId INTEGER,
      barangayName TEXT,
      reportType TEXT,
      description TEXT,
      timestamp TEXT,
      latitude REAL,
      longitude REAL,
      isSynced INTEGER
    );
  `);
};

export const insertReport = (report: any) => {
  const statement = db.prepareSync(`
    INSERT INTO queued_reports (id, barangayId, barangayName, reportType, description, timestamp, latitude, longitude, isSynced)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  statement.executeSync([
    report.id, report.barangayId, report.barangayName, report.reportType,
    report.description, report.timestamp, report.latitude, report.longitude, report.isSynced ? 1 : 0
  ]);
};

export const fetchAllReports = () => {
  return db.getAllSync('SELECT * FROM queued_reports ORDER BY timestamp DESC');
};

export const markReportSynced = (id: string) => {
  db.runSync('UPDATE queued_reports SET isSynced = 1 WHERE id = ?', [id]);
};