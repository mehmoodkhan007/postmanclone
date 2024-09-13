import React, { useState, useEffect } from "react";
import "./App.css";
import CollectionsList from "./components/CollectionsList";
import Requestparams from "./components/Requestparams";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faFileImport,
  faSearch,
  faCogs,
  faFolderOpen,
  faHistory,
  faSave,
  faBars,
  faEarth,
  faArrowLeft,
  faArrowRight,
  faTrashAlt,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";

function App() {
  const link = "http://127.0.0.1:8000/api/collections";
  const [data, setData] = useState([]);
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [bodyData, setBodyData] = useState("");
  const [response, setResponse] = useState("");
  const [savedResponseId, setSavedResponseId] = useState(null); // ID of saved response
  const [headers, setHeaders] = useState([]);
  const [history, setHistory] = useState([]);
  const [collectionName, setCollectionName] = useState("");
  const [selectedCollection, setSelectedCollection] = useState([]);
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(""); // New state for active section
  const [AllRequest, setAllRequest] = useState({}); // Object to store requests by collection ID
  const [params, setParams] = useState([]);
  const [selectedParams, setSelectedParams] = useState({ key: '', value: '' });
  const [requestId, setRequestId] = useState(); // State to hold the selected request ID

  const fetchCollection = async () => {
    const res = await fetch(link);
    const d = await res.json();
    return setData(d.sort((a, b) => a.id - b.id));
  };

  useEffect(() => {
    fetchCollection();
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = (e) => {
    if (!e.target.matches(".dropbtn")) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener("click", closeDropdown);
    return () => {
      window.removeEventListener("click", closeDropdown);
    };
  }, []);

  
  const handleSidebarClick = (section) => {
    if (activeSection === section) {
      setActiveSection(""); // Hide the section if it's already active
    } else {
      setActiveSection(section); // Show the section if it's not active
    }
  };

  const sendRequest = () => {
    // Convert params to query string
    const queryString = params
      .map(
        (param) =>
          `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`
      )
      .join("&");

    // Construct URL with query string for GET requests
    const requestUrl =
      method === "GET" && queryString ? `${url}?${queryString}` : url;

    // Prepare request options
    const requestOptions = {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: method !== "GET" ? JSON.stringify(bodyData) : null, // Include body only for non-GET requests
    };

    // Send the request
    fetch(requestUrl, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log("dataa", data);
        setResponse(JSON.stringify(data, null, 2)); // Display formatted JSON response
      })
      .catch((error) => {
        setResponse(`Error: ${error.message}`);
      });
  };

  const selectCollection = async (id) => {
    setSelectedCollection(id);

    const collectionId = id;
    try {
      // API call to fetch requests for the selected collection kia hu a, respone mai collection q hai ?change krna hoga na isay nahi , kuch bhi change kia is code mai tw code phat jaega
      const response = await fetch(
        `http://127.0.0.1:8000/api/collections/${collectionId}/requests`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch requests");
      }
//ek tw mobile bhi off hai baat karte tw sahi smjh atahn
      const requests = await response.json();
      console.log( "Requests for collection:", collectionId);

      // Store requests in an object where the key is the collection ID
      console.log(AllRequest, collectionId, requests);
      setAllRequest((prevRequests) => ({
        ...prevRequests,
        [collectionId]: requests,
      }));
      console.log("..........", {
        ...AllRequest,
        [collectionId]: requests,
      });

      // Remove the automatic setting of the first request here!
      // Now you are just fetching the requests and waiting for the user to select one
    } catch (error) {
      console.error("Error fetching collection requests:", error);
      // Handle error (e.g., show an alert or message to the user)
    }
  };



  const deleteRequest = (requestId) => {
    // Optional: Add confirmation
    const confirmation = window.confirm(
      "Are you sure you want to delete this request?"
    );
    console.log("Request  successfully", data);

    if (!confirmation) return;

    // Perform the API call to delete the request by ID  acha, dekho ab tmhari api chal rahi hai.but api ko kuch data chiye right?hn, ab wo data har response ka alag hoga jaise har response ka status wagerah alag hota hai, right ?hn.
    fetch(`http://127.0.0.1:8000/api/requests/${requestId}`, {//tw ham ne aysa nahi kia , ham ne data mai fix value dal di hai jaise status ko fix kardea id ko fix kardea ab? hamey waha par fixed chezon ko hatana hha
      //phle dkhte haui kia fixed hai ok ?hn function lao
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to delete request: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Request deleted successfully", data);
        // Remove the request from the frontend state
        const updatedCollections = data.map((collection) => {
          const updatedRequests = collection.requests.filter(
            (request) => request.id !== requestId
          );
          return { ...collection, requests: updatedRequests };
        });
        setData(updatedCollections); // Update the state
      })
      .catch((error) => {
        // console.error("Error deleting request:", error);
        // alert("Failed to delete the request.");
      });
  };

  const clearHistory = () => {
    setHistory([]);
    alert("History Cleared");
  };

  const searchPostman = () => {
    const query = document.querySelector(".search-bar input").value;
    alert(`Search for: ${query}`);
  };

  const handleNewTab = () => {
    setShowNewCollectionModal(true);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        try {
          const importedData = JSON.parse(content); // Assuming the file is in JSON format

          // Check if importedData.collections exists and is an array
          if (
            importedData.collections &&
            Array.isArray(importedData.collections)
          ) {
            // Update your state with the imported data
            setData([...data, ...importedData.collections]);
            alert("File imported successfully!");
          } else {
            alert("Invalid file format: collections should be an array.");
          }
        } catch (error) {
          alert(
            "Failed to import file. Please ensure the file is in the correct format."
          );
        }
      };
      reader.readAsText(file);
    }
  };

  const saveRequestToCollection = () => {
    if (selectedCollection !== null) {
      // Ensure valid URL and method are provided
      if (!url || !method) {
        alert("Please provide a valid URL and method.");
        return;
      }

      // Prepare the request payload
      const requestPayload = {
        collection_id: selectedCollection,
        url: url,
        method: method,
        body: { ...bodyData }, // Request body
        bodytype: "raw", // This should match the enum values exactly
        // params: params
      };

      console.log("requestPayload", requestPayload);

      // Make the API call to save the request
      fetch("http://127.0.0.1:8000/api/save_request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      })
        .then((response) => {
          console.log("response status:", response.status);

          return response.json(); // Return JSON response for further handling
        })
        .then((data) => {
          console.log("Server response:", data);

          if (data.status === "success") {
            alert("Request saved successfully!");
            console.log(
              AllRequest,
              selectedCollection,
              AllRequest?.[selectedCollection]
            );
            setAllRequest((prevRequests) => {
              console.log(",,,,,,,,,,,,,,,,,,,,,,,,,", {
                ...prevRequests,
                [selectedCollection]: [
                  ...prevRequests[selectedCollection],
                  data,
                ],
              });
              return {
                ...prevRequests,
                [selectedCollection]: [
                  ...prevRequests[selectedCollection],
                  data,
                ],
              };
            });
            console.log(
              AllRequest,
              selectedCollection,
              AllRequest?.[selectedCollection]
            );
          } else {
            console.error("Backend error:", data.message);
            alert(`Failed to save request: ${data.message}`);
          }
        })
        .catch((error) => {
          console.error("Error saving request:", error);
          // alert(`Failed to save request: ${error.message}`);
        });
    } else {
      alert("Please select a collection to save the request.");
    }
  };


  const saveResponseToDatabase = async (response) => {
    
    // Check if requestId is valid
    if (!requestId) {
      console.error('Request ID is missing, cannot save response');
      return;
    }
    console.log(response,"i am response body ")
    // Create the response payload with the correct structure
    const responsePayload = {
      request_id: Number(requestId), // Ensure requestId is a number ye sahi haihn
      body: {
        status: "success", // 
        data: {
          "0": JSON.stringify(response, null, 2), // Convert response to a string, formatted with indentation
          id: 7370 // Example ID; replace with the appropriate ID if needed, ye fixed haihn
        },
        message: "Successfully! Record has been added." // Example message //ye bhi
      }
    };
    try {
      const response = await fetch('http://127.0.0.1:8000/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responsePayload), // Convert the entire payload to a JSON string
      });
  
      if (!response.ok) {
        const errorData = await response.json(); // Parse the error response
        throw new Error(`Server responded with error: ${JSON.stringify(errorData)}`);
      }
  
      const data = await response.json(); // Parse the successful response
      setSavedResponseId(data.id); // Save the response ID
      console.log('Response successfully saved with ID:', data.id);
    } catch (error) {
      console.error('Error saving response to database:', error);
    }
  };
  
  
  
  
  

  // Function to update the saved response
  const updateResponse = () => {
    if (!savedResponseId) {
      console.log("No response to update");
      return;
    }

    const updatePayload = {
      body: response,
    };

    fetch(`http://127.0.0.1:8000/api/responses/${savedResponseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Response updated:', data);
      })
      .catch((error) => {
        console.error('Error updating response:', error);
      });
  };

  // Function to delete the saved response
  const deleteResponse = () => {
    if (!savedResponseId) {
      console.log("No response to delete");
      return;
    }

    fetch(`http://127.0.0.1:8000/api/responses/${savedResponseId}`, {
      method: 'DELETE',
    })
      .then(() => {
        console.log('Response deleted');
        setSavedResponseId(null); // Clear the saved response ID after deletion
      })
      .catch((error) => {
        console.error('Error deleting response:', error);
      });
  };
  const createNewCollection = () => {
    if (newCollectionName.trim()) {
      // Prepare the request payload
      const newCollection = {
        name: newCollectionName,
        requests: [], // Initialize with an empty requests array
      };

      // Make the API call to save the new collection
      fetch("http://127.0.0.1:8000/api/add_collection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any necessary headers, like Authorization, if needed
        },
        body: JSON.stringify(newCollection), // Send the new collection as JSON
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          fetchCollection();
          return response.json();
        })
        .then((data) => {
          console.log("Collection saved:", data);
          // Update the local state with the newly created collection
          setData([...data, data]); // Add the new collection returned from the backend
          setNewCollectionName("");
          setShowNewCollectionModal(false);
          alert("New collection saved successfully!");
        })
        .catch((error) => {
          console.error("Error saving collection:", error);
          setShowNewCollectionModal(false);
        });
    } else {
      alert("Please enter a valid collection name.");
    }
  };
  return (
    <div className="App">
      <div className="fullhead">
        <div className="dropdown">
          <button onClick={toggleDropdown} className="dropbtn">
            <FontAwesomeIcon icon={faBars} />
          </button>
          <div
            className={`dropdown-content ${isOpen ? "show" : ""}`}
            id="myDropdown"
          >
            <a href="#home">File</a>
            <a href="#about">Edit</a>
            <a href="#contact">View</a>
          </div>
        </div>
        <div className="arrows">
          <div className="leftarrow">
            <FontAwesomeIcon icon={faArrowLeft} />
          </div>

          <div className="rightarrow">
            <FontAwesomeIcon icon={faArrowRight} />
          </div>
        </div>
        <div className="slogans">
          <ul>
            <li>Home</li>
            <li>
              <select>
                <option>
                  Workspace &nbsp;
                  <FontAwesomeIcon icon={faArrowDown} />
                </option>
                <option>two</option>
              </select>
            </li>
            <li>
              <select>
                <option>
                  API Network &nbsp;
                  <FontAwesomeIcon icon={faArrowDown} />
                </option>
                <option>two</option>
              </select>
            </li>
          </ul>
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Search Postman" />
          <button onClick={searchPostman}>
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
      </div>
      <div className="fullbody">
        <div className="sidebar">
          <div className="logo">
            <center>
              <FontAwesomeIcon
                icon={faEarth}
                onClick={() => handleSidebarClick("collections")}
              />
            </center>
          </div>
          <ul className="menu">
            <li onClick={() => handleSidebarClick("collections")}>
              <center>
                <FontAwesomeIcon icon={faFolderOpen} />
              </center>
              <br />
              <a> Collections</a>
            </li>
            <li onClick={() => handleSidebarClick("workspace")}>
              <center>
                <FontAwesomeIcon icon={faCogs} />
              </center>
              <br />
              <a> Workspace</a>
            </li>

            <li onClick={clearHistory}>
              <center>
                <FontAwesomeIcon icon={faHistory} />
              </center>
              <br />
              <a> Clear History</a>
            </li>
          </ul>
        </div>
        {activeSection === "collections" && (
          <div className="main-content">
            <header className="header">
              <div className="tabs" id="workspaceid">
                <div className="tabsworkspace">
                  <span>My workspace</span>
                </div>
                <div className="tabsbutton">
                  {" "}
                  <button className="new-tab" onClick={handleNewTab}>
                    {" "}
                    New
                  </button>
                  <input
                    type="file"
                    accept=".json"
                    style={{ display: "none" }}
                    id="file-input"
                    onChange={handleImport}
                  />
                  <button
                    className="import-tab"
                    onClick={() =>
                      document.getElementById("file-input").click()
                    }
                  >
                    Import
                  </button>
                </div>
              </div>
            </header>

            <div className="content">
              <div className="sidebar-secondary">
                <div className="newcollectiondiv">
                  <button onClick={() => setShowNewCollectionModal(true)}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                  
                  <input
                    type="text"
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                    placeholder="Enter name"
                  />
                </div>

                <CollectionsList
                  data={data}
                  AllRequest={AllRequest}
                  selectedCollection={selectedCollection}
                  selectCollection={selectCollection}
                  setMethod={setMethod}
                  fetchCollection={fetchCollection}
                  setUrl={setUrl}
                  setHeaders={setHeaders}
                  setBodyData={setBodyData}
                  deleteRequest={deleteRequest}
                  setRequestId={setRequestId}
                />
              </div>

              {showNewCollectionModal && (
                <div className="modal">
                  <div className="modal-content">
                    <input
                      type="text"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="New collection name"
                    />
                    <button onClick={createNewCollection}>
                      Create Collection
                    </button>
                    <button onClick={() => setShowNewCollectionModal(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="workspace">
          <div className="request-builder">
            <div className="requestfetch">
              <select
                id="method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="GET" className="colorGET">
                  GET
                </option>
                <option value="POST" className="colorPOST">
                  POST
                </option>
                <option value="PUT" className="colorPUT">
                  PUT
                </option>
                <option value="DELETE" className="colorDELETE">
                  DELETE
                </option>
                <option value="PATCH" className="colorPATCH">
                  PATCH
                </option>
              </select>
              <input
                type="text"
                id="url"
                placeholder="Enter URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button id="send-button" onClick={sendRequest}>
                Send
              </button>
            </div>
            <Requestparams
              params={params}
              requestId={requestId}
              url={url}
              setSelectedParams={setSelectedParams}
            />

          
            <textarea
              id="body-data"
              placeholder="Request Body"
              value={bodyData}
              onChange={(e) => setBodyData(e.target.value)}
            />
          </div>

          <div className="savecollection">
            <button onClick={saveRequestToCollection}>
              <FontAwesomeIcon icon={faSave} /> Save
            </button>
          </div>

          <div className="response-area">
                {/* Conditionally show buttons if a response is saved */}
                {!savedResponseId ? (
                  <button onClick={() => saveResponseToDatabase(response)}>  
                    Save Response
                  </button>
                    ) : (
                      <div>
                        <button onClick={updateResponse}>Update Response</button>
                        <button onClick={deleteResponse}>Delete Response</button>
                      </div>
                    )}
                    {response && (
                  <div>
                    <h3>Response:</h3>
                    <pre>{response}</pre>

                  </div>
                )}
           </div>
        </div>

        {showNewCollectionModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>Create New Collection</h2>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection Name"
              />
              <button onClick={createNewCollection}>Create</button>
              <button onClick={() => setShowNewCollectionModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
