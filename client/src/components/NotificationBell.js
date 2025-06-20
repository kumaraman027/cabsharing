// import React, { useContext, useState, useEffect } from "react";
// import { AuthContext } from "../context/AuthContext";

// export default function NotificationBell() {
//   const { user } = useContext(AuthContext);
//   const [joinRequests, setJoinRequests] = useState([]);
//   const [showDropdown, setShowDropdown] = useState(false);

//   useEffect(() => {
//     const requests = JSON.parse(localStorage.getItem("joinRequests")) || [];
//     // Filter requests for rides owned by current user and are pending
//     const myRequests = requests.filter(
//       (req) => req.rideOwner === user?.name && req.status === "pending"
//     );
//     setJoinRequests(myRequests);
//   }, [user]);

//   const acceptRequest = (id) => {
//     let requests = JSON.parse(localStorage.getItem("joinRequests")) || [];
//     requests = requests.map((req) =>
//       req.id === id ? { ...req, status: "accepted" } : req
//     );
//     localStorage.setItem("joinRequests", JSON.stringify(requests));
//     setJoinRequests(requests.filter((req) => req.rideOwner === user.name && req.status === "pending"));
//   };

//   const rejectRequest = (id) => {
//     let requests = JSON.parse(localStorage.getItem("joinRequests")) || [];
//     requests = requests.map((req) =>
//       req.id === id ? { ...req, status: "rejected" } : req
//     );
//     localStorage.setItem("joinRequests", JSON.stringify(requests));
//     setJoinRequests(requests.filter((req) => req.rideOwner === user.name && req.status === "pending"));
//   };

//   return (
//     <div className="relative inline-block">
//       <button
//         className="relative focus:outline-none"
//         onClick={() => setShowDropdown(!showDropdown)}
//       >
//         <svg
//           className="w-6 h-6 text-gray-600"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth="2"
//             d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-9.33-5.158"
//           ></path>
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth="2"
//             d="M13 21h-2a2 2 0 002-2v-2"
//           ></path>
//         </svg>

//         {joinRequests.length > 0 && (
//           <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
//             {joinRequests.length}
//           </span>
//         )}
//       </button>

//       {showDropdown && (
//         <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-300 rounded shadow-lg z-10 p-2 max-h-80 overflow-y-auto">
//           {joinRequests.length === 0 ? (
//             <div className="p-2 text-center text-gray-500">No new requests</div>
//           ) : (
//             joinRequests.map((req) => (
//               <div key={req.id} className="border-b last:border-b-0 p-2">
//                 <div>
//                   <strong>{req.requesterUser}</strong> wants to join your ride from <em>{req.from}</em> to <em>{req.to}</em>.
//                 </div>
//                 <div className="mt-2 flex space-x-2">
//                   <button
//                     onClick={() => acceptRequest(req.id)}
//                     className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
//                   >
//                     Accept
//                   </button>
//                   <button
//                     onClick={() => rejectRequest(req.id)}
//                     className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
//                   >
//                     Reject
//                   </button>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
