const GRAPHQL_ENDPOINT = 'http://localhost:8080/oauth/graphql';

export async function graphqlRequest(query, variables = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(result.errors[0].message || 'GraphQL Error');
    }

    return result.data;
  } catch (error) {
    console.error('GraphQL Request failed:', error);
    throw error;
  }
}
