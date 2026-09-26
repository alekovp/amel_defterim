/**
 * Deployment settings. Edit src/gas/Config.gs, then rebuild — dist/ is generated.
 */
var CONFIG = {
  // Leave blank: setupRegister() creates the register and the documents folder
  // and stores their IDs in Script Properties. Fill in only to point at existing ones.
  registerSpreadsheetId: '',
  documentsFolderId: '',

  financeOfficerEmail: 'finance-officer@paragonisc.edu.kh',
  replyToEmail: 'finance-officer@paragonisc.edu.kh',

  // Signed-in users on this domain may open ?view=staff. Deploy from an account
  // on this same domain, or Session.getActiveUser() returns nothing and nobody
  // gets the staff view.
  staffDomain: 'paragonisc.edu.kh',

  timezone: 'Asia/Phnom_Penh',

  // OFF until the Finance Committee approves the fee rules and the delegation
  // table. While off, a request that is within the published policy goes to the
  // Finance Officer to confirm (status 30) instead of closing itself (status 15).
  // Requests that rely on an unpublished rule never auto-resolve, whatever this says.
  autoResolveEnabled: false
};

function cfg_(key) {
  if (CONFIG[key] !== '' && CONFIG[key] !== undefined && CONFIG[key] !== null) return CONFIG[key];
  return PropertiesService.getScriptProperties().getProperty(key) || '';
}
