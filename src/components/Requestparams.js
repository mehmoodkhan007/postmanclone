import React, { useState, useEffect } from 'react';

const Requestparams = ({ requestId ,url }) => {
  const [params, setParams] = useState([]);
  const [newParam, setNewParam] = useState({ key: '', value: '' });
  const [editParam, setEditParam] = useState(null);
  const [error, setError] = useState('');
  const [urlparam, setUrlparam] = useState(''); // Base URL
  // Fetch parameters when component mounts or when requestId changes
  useEffect(() => {
    if (requestId) {
      fetchParams();
    }
  }, [requestId]);

  // Fetch existing parameters for the given request ID
  const fetchParams = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/get_params/${requestId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch params: ${response.statusText}`);
      }
      const data = await response.json();
      setParams(data.params);
      updateUrlWithParams(data.params); // Update URL with fetched params
    } catch (error) {
      setError(`NO params exixts: ${error.message}`);
    }
  };

  // Update URL with the current parameters
  const updateUrlWithParams = (updatedParams) => {
    const queryString = updatedParams
      .filter(param => param.key) // Only include parameters with a key
      .map(param => {
        const encodedKey = encodeURIComponent(param.key);
        const encodedValue = param.value ? `=${encodeURIComponent(param.value)}` : '';
        return `${encodedKey}${encodedValue}`;
      })
      .join('&');

    const baseUrl = urlparam.split('?')[0]; // Split the base URL from query string
    setUrlparam(queryString ? `${baseUrl}?${queryString}` : baseUrl); // Update the URL
  };

  // Handle adding a new parameter
  const handleAddParam = async () => {
    try {
      const payload = {
        key: newParam.key,
        value: newParam.value,
        request_id: requestId,
      };

      const response = await fetch('http://127.0.0.1:8000/api/add_param', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to add param: ${response.statusText}`);
      }

      setNewParam({ key: '', value: '' }); // Clear input fields after successful addition
      fetchParams(); // Refresh the parameter list
    } catch (error) {
      setError(`Error adding param: ${error.message}`);
    }
  };

  // Handle updating an existing parameter
  const handleUpdateParam = async (paramId) => {
    try {
      const payload = {
        key: editParam.key,
        value: editParam.value,
      };

      const response = await fetch(`http://127.0.0.1:8000/api/update_param/${paramId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to update param: ${response.statusText}`);
      }

      setEditParam(null); // Clear the edit state after success
      fetchParams(); // Refresh the parameter list
    } catch (error) {
      setError(`Error updating param: ${error.message}`);
    }
  };

  // Handle deleting a parameter
  const handleDeleteParam = async (paramId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/delete_param/${paramId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete param: ${response.statusText}`);
      }

      fetchParams(); // Refresh the parameter list after deletion
    } catch (error) {
      setError(`Error deleting param: ${error.message}`);
    }
  };

  // Handle editing an existing parameter
  const handleEditClick = (param) => {
    setEditParam(param); // Set the parameter to be edited
  };

  // Handle canceling the edit
  const handleCancelEdit = () => {
    setEditParam(null); // Clear the edit state
  };
  
  return (
    <div>
      <h2>Parameters for Request ID: {requestId}</h2>

      {/* Add Parameter Form */}
      <div>
        <h3>Add Parameter</h3>
        <input
          type="text"
          placeholder="Key"
          value={newParam.key}
          onChange={(e) => setNewParam({ ...newParam, key: e.target.value })}
        />
        <input
          type="text"
          placeholder="Value"
          value={newParam.value}
          onChange={(e) => setNewParam({ ...newParam, value: e.target.value })}
        />
        <button onClick={handleAddParam}>Add</button>
      </div>

      {/* Parameter List */}
      <h3>Existing Parameters</h3>
      <div className='paramdiv'>
      <ul >
        {params.map((param, index) => (
          <li key={param.id}
          onClick={() => {
            // Update the form with the selected request's details
            console.log("heloooooooooooooooo",url);
             }}>
            {editParam && editParam.id === param.id ? (
              <div>
                <input
                  type="text"
                  value={editParam.key}
                  onChange={(e) => setEditParam({ ...editParam, key: e.target.value })}
                />
                <input
                  type="text"
                  value={editParam.value}
                  onChange={(e) => setEditParam({ ...editParam, value: e.target.value })}
                />
                <button onClick={() => handleUpdateParam(param.id)}>Save</button>
                <button onClick={handleCancelEdit}>Cancel</button>
              </div>
            ) : (
              <div>
                <strong>Key:</strong> {param.key}, <strong>Value:</strong> {param.value}
                <button onClick={() => handleEditClick(param)}>Edit</button>
                <button onClick={() => handleDeleteParam(param.id)}>Delete</button>
              </div>
            )}
          </li>
        ))}
      </ul>
      </div>
      {/* Show updated URL */}
      <p><strong>Current URL:</strong> {url}{urlparam}
      </p>

      {/* {error && <p style={{ color: 'red' }}>{error}</p>} */}
    </div>
  );
};

export default Requestparams;
