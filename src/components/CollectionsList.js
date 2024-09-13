import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTrashAlt } from '@fortawesome/free-solid-svg-icons'; // Import necessary icons
import { useState } from 'react';

const CollectionsList = ({ data, setRequestId, AllRequest, selectedCollection, fetchCollection, selectCollection, setMethod, setUrl, setHeaders, setBodyData, deleteRequest }) => {
  const [menuVisible, setMenuVisible] = useState({});
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [collectionToUpdate, setCollectionToUpdate] = useState(null);
  const [collectionId, setCollectionId] = useState(); // Ensure collectionId is properly managed

  // Toggle the visibility of the dropdown menu for the collection
  // Not provided in original code but if needed, add logic here

  // Function to handle the API call to update a collection
  const updateCollection = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/update_collection/${collectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_name: newCollectionName }), // Send the new name in the request body
      });
      console.log('API Response:', response); // Log the response

      if (response.ok) {
        const result = await response.json();
        console.log('Collection updated:', result);
        setNewCollectionName('');
        fetchCollection(); // Re-fetch the collections after updating
      } else {
        console.error('Failed to update collection. Status:', response.status);
      }
    } catch (error) {
      console.error('Error updating collection:', error);
    }
  };

  // Function to handle the API call to delete a collection
  const deleteCollection = async (collectionId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/delete_collection/${collectionId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        console.log(`Collection with ID ${collectionId} deleted`);
        fetchCollection(); // Re-fetch all collections after deletion
      } else {
        console.error('Failed to delete collection');
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  // Open the modal and set the collection to be updated
  const handleUpdateClick = (collection) => {
    setNewCollectionName(''); // Clear any previous values
    setCollectionToUpdate(collection.name);
    setCollectionId(collection.id); // Set the collection ID here
    setShowUpdateModal(true); // Show modal for updating collection
  };

  // Submit the new name for the collection update
  const handleUpdateSubmit = () => {
    if (newCollectionName) {
      console.log("Updating collection with new name:", newCollectionName); // Check new name value
      updateCollection(); // Update collection with new name
      setShowUpdateModal(false); // Close modal after updating
      setNewCollectionName(''); // Reset input
    }
  };

  return (
    <div className="collections-list">
      {data.length > 0 ? (
        data.map((collection, index) => (
          <div
            key={index}
            className={`collection-item ${selectedCollection === collection?.id ? 'selected' : ''}`}
            onClick={() => selectCollection(collection?.id)}
          >
            <div className="collection-header">
              <p>{collection.name}</p>
              <p className='option'>
                {/* Dropdown menu for collection options */}
                <select
                  className="dropdown-menu"
                  defaultValue="action"  // This will ensure a placeholder is shown, and the dropdown remains open
                  onChange={(e) => {
                    if (e.target.value === 'update') {
                      handleUpdateClick(collection); // Open modal to update collection
                    } else if (e.target.value === 'delete') {
                      if (window.confirm('Are you sure you want to delete this collection and all associated data?')) {
                        deleteCollection(collection.id); // Pass the collection ID to delete
                      }
                    }
                    e.target.value = 'action'; // Reset the dropdown to the default after selection
                  }}
                  onClick={(e) => e.stopPropagation()} // Prevent parent onClick from triggering
                >
                  <option value="action" disabled>....</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                </select>

              </p>
            </div>

            {selectedCollection === collection.id && (
              <ul>
                {AllRequest[collection.id]?.length > 0 ? (
                  AllRequest[collection.id].map((request, requestIndex) => (
                    <li
                      key={request.id} // Assuming each request has a unique `id`
                      onClick={() => {
                        // Update the form with the selected request's details
                        setRequestId(request.id);
                        setMethod(request.method);
                        setUrl(request.url);
                        setHeaders(request.headers || []); // Default to an empty array if headers are undefined
                        const bodyString = typeof request.body === 'object' ? JSON.stringify(request.body, null, 2) : request.body;
                        setBodyData(bodyString || '');
                      }}
                    >
                      <span className="request-text">
                        <span>{request.method}</span> {request.url}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent parent onClick from triggering
                          deleteRequest(request.id); // Pass the request ID for deletion
                        }}
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    </li>
                  ))
                ) : (
                  <li>No requests available</li>
                )}
              </ul>
            )}
          </div>
        ))
      ) : (
        <p>No collections available</p>
      )}

      {/* Modal for updating collection name */}
      {showUpdateModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Update Collection Name</h3>
            <input
              type="text"
              placeholder="Enter new collection name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
            />
            <button onClick={handleUpdateSubmit}>Update</button>
            <button onClick={() => setShowUpdateModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsList;
