import { createLogger } from './logger.utils.js';
import { securityAuditConfig } from '../config/security.config.js';
import { LOG_MESSAGES } from './log_messages.utils.js';
import { CONSTANTS } from './constants.utils.js';

const logger = createLogger('security-audit-service');
let auditLogs = [];

const determineSeverity = (eventType) => {
  const severityMap = {
    login: CONSTANTS.LOG_LEVELS.INFO,
    logout: CONSTANTS.LOG_LEVELS.INFO,
    passwordChange: CONSTANTS.LOG_LEVELS.WARNING,
    roleChange: CONSTANTS.LOG_LEVELS.WARNING,
    tokenRefresh: CONSTANTS.LOG_LEVELS.INFO,
    failedLogin: CONSTANTS.LOG_LEVELS.WARNING,
    suspiciousActivity: CONSTANTS.LOG_LEVELS.ERROR,
    securityBreach: CONSTANTS.LOG_LEVELS.ERROR,
  };

  return severityMap[eventType] || CONSTANTS.LOG_LEVELS.INFO;
};

const cleanupOldLogs = () => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - securityAuditConfig.retentionDays);
  auditLogs = auditLogs.filter((log) => new Date(log.timestamp) > cutoffDate);
};

const logSecurityEvent = (event) => {
  if (!securityAuditConfig.enabled) return;

  const auditEntry = {
    timestamp: new Date().toISOString(),
    ...event,
    severity: determineSeverity(event.type),
  };

  logger.info(LOG_MESSAGES.SECURITY.AUDIT.Event, auditEntry);
  auditLogs.push(auditEntry);
  cleanupOldLogs();
};

const getAuditLogs = (filters = {}) => {
  let filteredLogs = [...auditLogs];

  if (filters.type) {
    filteredLogs = filteredLogs.filter((log) => log.type === filters.type);
  }

  if (filters.userId) {
    filteredLogs = filteredLogs.filter((log) => log.userId === filters.userId);
  }

  if (filters.severity) {
    filteredLogs = filteredLogs.filter(
      (log) => log.severity === filters.severity
    );
  }

  if (filters.startDate) {
    filteredLogs = filteredLogs.filter(
      (log) => new Date(log.timestamp) >= new Date(filters.startDate)
    );
  }

  if (filters.endDate) {
    filteredLogs = filteredLogs.filter(
      (log) => new Date(log.timestamp) <= new Date(filters.endDate)
    );
  }

  return filteredLogs;
};

const getSecurityStats = () => {
  const stats = {
    totalEvents: auditLogs.length,
    eventsByType: {},
    eventsBySeverity: {},
    recentEvents: auditLogs.slice(-10),
  };

  auditLogs.forEach((log) => {
    stats.eventsByType[log.type] = (stats.eventsByType[log.type] || 0) + 1;
    stats.eventsBySeverity[log.severity] =
      (stats.eventsBySeverity[log.severity] || 0) + 1;
  });

  return stats;
};

export const securityAudit = {
  logSecurityEvent,
  getAuditLogs,
  getSecurityStats,
};
