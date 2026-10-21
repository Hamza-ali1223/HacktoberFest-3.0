const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred while communicating with the server.');
  }

  return data;
}

export const api = {
  // Stats
  getStats: () => request('/stats'),

  // Users
  getUsers: () => request('/users'),
  getUser: (id) => request(`/users/${id}`),

  // Gigs
  getGigs: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'All') {
        params.append(key, val);
      }
    });
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/gigs${query}`);
  },
  getGig: (id) => request(`/gigs/${id}`),
  createGig: (data) => request('/gigs', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateGig: (id, data) => request(`/gigs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),

  // Applications
  getGigApplications: (gigId) => request(`/gigs/${gigId}/applications`),
  getUserApplications: (userId) => request(`/applications/user/${userId}`),
  applyToGig: (gigId, data) => request(`/gigs/${gigId}/applications`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateApplicationStatus: (id, data) => request(`/applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),

  // Reviews
  getReviews: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.gig_id) searchParams.append('gig_id', params.gig_id);
    if (params.user_id) searchParams.append('user_id', params.user_id);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request(`/reviews${query}`);
  },
  createReview: (data) => request('/reviews', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};
