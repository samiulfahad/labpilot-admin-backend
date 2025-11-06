// Store in custom format: "DD Month YYYY, HH:mm:ss AM/PM"
const getGMT = () => {
  const date = new Date(Date.now() + (6 * 60 * 60 * 1000));
  
  // Month names array
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Extract components for formatting
  const year = date.getUTCFullYear();
  const month = monthNames[date.getUTCMonth()];
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  let hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  // Convert to AM/PM
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12 AM
  const hours12 = String(hours).padStart(2, '0');
  
  return `${day} ${month} ${year}, ${hours12}:${minutes}:${seconds} ${ampm}`;
};

module.exports = getGMT;