  {/* <div className="headers">
              <input
                value={headerKey}
                onChange={(e) => setHeaderKey(e.target.value)}
                placeholder="Header Key"
              />
              <input id="header-value" placeholder="Header Value" />
              <button onClick={addHeader}>Add Header</button>
              <div id="headers-list">
                {headers.map((header, index) => (
                  <div key={index}>
                    {header.key}: {header.value}
                  </div>
                ))}
              </div>
            </div> */}
            // const saveCollection = () => {
                //         if (collectionName) {
                //             const newCollection = {
                //                 name: collectionName,
                //                 requests: [{ method, url, headers, bodyData }],
                //             };
                //             setData([...data, newCollection]);
                //             setCollectionName('');
                //             setHeaders([]);
                //             setUrl('');
                //             setBodyData('');
                //             alert('Collection Saved!');
                //         } else {
                //             alert('Please enter a collection name');
                //         }
                //     };
              
                //     const saveToExistingCollection = () => {
                //         if (selectedCollection !== null) {
                //             const updatedCollections = data.map((collection, index) => {
                //                 if (index === selectedCollection) {
                //                     return {
                //                         ...collection,
                //                         requests: [...collection.requests, { method, url, headers, bodyData }],
                //                     };
                //                 }
                //                 return collection;
                //             });
                //             setData(updatedCollections);
                //             setHeaders([]);
                //             setUrl('');
                //             setBodyData('');
                //             alert('Request Saved to Existing Collection!');
                //         } else {
                //             alert('Please select a collection to save');
                //         }
                //     };