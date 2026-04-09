import axios from 'axios';
import { API_BASE_URL } from '@env';

console.log('API_BASE_URL:', API_BASE_URL);

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ------------------------------
// Dealer / Builder Registration
// ------------------------------
export const registerDealer = (data) => {
   return API.post('/business/register-dealer', data);
};

// Login with phone and password
export const loginWithPassword = (phone, password) => {
  return API.post('/auth/login', { phone, password });
};

// Guest onboarding: Send OTP
export const sendGuestOtp = (phone) => {
  return API.post('/auth/guest/send-otp', { phone });
};

// Guest onboarding: Verify OTP
export const verifyGuestOtp = (phone, otp) => {
  return API.post('/auth/guest/verify-otp', { phone, otp });
};

// ------------------------------
// Dynamic Property Map
// ------------------------------
export const getSectors = () => {
  return API.get('/sectors');
};

export const getBlocksBySector = (sectorId) => {
  return API.get(`/blocks/${sectorId}`);
};

export const getPocketsByBlock = (blockId) => {
  return API.get(`/pockets/${blockId}`);
};

// export const getPlotsByPocket = (pocketId) => {
//   console.log("Pocket object:", pocket);
//   return API.get('/plots', { params: { pocket_id: pocketId } });
// };
export const getPlotsByPocket = (pocketId) => {
  console.log('[API] GET /plots', { pocket_id: pocketId });
  return API.get('/plots', { params: { pocket_id: pocketId } })
    .then((response) => {
      const count = Array.isArray(response?.data) ? response.data.length : 'non-array';
      console.log('[API] /plots response count:', count);
      return response;
    })
    .catch((error) => {
      console.log(
        '[API] /plots error:',
        error?.response?.status,
        error?.response?.data || error?.message,
      );
      throw error;
    });
};

export const getPlotDetails = (plotRef) => {
  return API.get(`/plots/${plotRef}`);
};

// ------------------------------
// Dealer Listing (NEW)
// ------------------------------
export const createPlotDealerListing = (data) => {
  return API.post('/plot-dealers', data);
};

export const getMyListings = (userId, status) => {
  const params = {};
  if (status) {
    params.status = status;
  }

  return API.get(`/plot-dealers/my/${userId}`, { params });
};

export const getOwnerPendingListings = (ownerUserId) => {
  if (ownerUserId === null || ownerUserId === undefined || ownerUserId === "") {
    return API.get('/owner/pending');
  }

  return API.get('/owner/pending', {
    params: { owner_user_id: Number(ownerUserId) },
  });
};

export const getOwnerRejectedListings = (ownerUserId) => {
  if (ownerUserId === null || ownerUserId === undefined || ownerUserId === "") {
    return API.get('/owner/rejected');
  }

  return API.get('/owner/rejected', {
    params: { owner_user_id: Number(ownerUserId) },
  });
};

export const getOwnerApprovedListings = (ownerUserId) => {
  if (ownerUserId === null || ownerUserId === undefined || ownerUserId === "") {
    return API.get('/owner/approved');
  }

  return API.get('/owner/approved', {
    params: { owner_user_id: Number(ownerUserId) },
  });
};

export const approveOwnerListing = (plotDealerId) => {
  return API.post('/owner/approve', {
    plot_dealer_id: plotDealerId,
  });
};

export const rejectOwnerListing = (plotDealerId) => {
  return API.post('/owner/reject', {
    plot_dealer_id: plotDealerId,
  });
};

//To show the plot deatils 
export const getPlotDealersByPlotId = (plotId) => {
  console.log('[API] GET /plot-dealers/by-plot', plotId);

  return API.get(`/plot-dealers/by-plot/${plotId}`)
    .then((response) => {
      console.log('[API] plot-dealers response:', response?.data);
      return response;
    })
    .catch((error) => {
      console.log(
        '[API] plot-dealers error:',
        error?.response?.status,
        error?.response?.data || error?.message,
      );
      throw error;
    });
};

export const saveFcmToken = (data) => {
  return API.post('/auth/save-fcm-token', data);
};

//Get Notifications (for Notification Screen)
export const getNotifications = (userId) => {
  return API.get('/notifications', {
    params: { user_id: userId }
  });
};

//Get Unread Count (for Dashboard icon)
export const getUnreadCount = (userId) => {
  return API.get('/notifications/unread-count', {
    params: { user_id: userId }
  });
};

// Mark notification as read (USER)
export const markNotificationAsRead = (id) => {
  return API.put(`/notifications/user/${id}/read`);
};

export const getFilters = (propertyType) => {
  return API.get('/plot-dealers/filters', {   // ✅ FIX HERE
    params: { property_type: propertyType }
  });
};