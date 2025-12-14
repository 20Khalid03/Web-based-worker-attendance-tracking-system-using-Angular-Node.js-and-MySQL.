const getCurrentMonthRange = () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Le dernier jour du mois actuel
    return {
      startDate: startDate.toISOString().split('T')[0], // Format YYYY-MM-DD
      endDate: endDate.toISOString().split('T')[0] // Format YYYY-MM-DD
    };
  };
  