"use client";

import React, { useState } from "react";
import { X, MapPin, Search } from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";

// Comprehensive Indian cities by state
const INDIAN_LOCATIONS = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kakinada", "Anantapur", "Kadapa"],
    "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro", "Bomdila"],
    "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Raigarh", "Jagdalpur"],
    "Delhi NCR": ["Delhi", "New Delhi", "Noida", "Gurgaon", "Faridabad", "Ghaziabad", "Greater Noida"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Nadiad", "Mehsana", "Morbi"],
    "Haryana": ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Karnal", "Rohtak", "Hisar", "Sonipat", "Panchkula", "Yamunanagar"],
    "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Solan", "Mandi", "Kullu", "Hamirpur", "Bilaspur", "Palampur"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh"],
    "Karnataka": ["Bangalore", "Mysore", "Mangalore", "Hubli", "Belgaum", "Gulbarga", "Davanagere", "Bellary", "Bijapur", "Shimoga", "Tumkur", "Udupi"],
    "Kerala": ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Kannur", "Kollam", "Palakkad", "Alappuzha", "Malappuram", "Kottayam"],
    "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa", "Katni", "Singrauli"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Solapur", "Kolhapur", "Amravati", "Navi Mumbai", "Sangli", "Jalgaon", "Akola", "Latur"],
    "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur"],
    "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongstoin"],
    "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip"],
    "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada"],
    "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot", "Hoshiarpur", "Moga"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar", "Bharatpur", "Bhilwara", "Sikar", "Pali", "Tonk"],
    "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Tirunelveli", "Tiruppur", "Erode", "Vellore", "Thoothukudi", "Thanjavur", "Dindigul", "Kanchipuram"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahbubnagar", "Nalgonda"],
    "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Allahabad", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Noida", "Firozabad", "Jhansi", "Muzaffarnagar"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh", "Nainital", "Mussoorie"],
    "West Bengal": ["Kolkata", "Siliguri", "Durgapur", "Asansol", "Howrah", "Darjeeling", "Kharagpur", "Haldia", "Bardhaman", "Malda"],
    "Andaman and Nicobar": ["Port Blair", "Diglipur", "Rangat"],
    "Chandigarh": ["Chandigarh"],
    "Dadra and Nagar Haveli": ["Silvassa"],
    "Daman and Diu": ["Daman", "Diu"],
    "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur", "Kathua"],
    "Ladakh": ["Leh", "Kargil"],
    "Lakshadweep": ["Kavaratti"],
    "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
};

// Popular cities for quick selection (top metros and tourist destinations)
const POPULAR_CITIES = [
    { city: "Mumbai", state: "Maharashtra" },
    { city: "Delhi", state: "Delhi NCR" },
    { city: "Bangalore", state: "Karnataka" },
    { city: "Hyderabad", state: "Telangana" },
    { city: "Chennai", state: "Tamil Nadu" },
    { city: "Kolkata", state: "West Bengal" },
    { city: "Pune", state: "Maharashtra" },
    { city: "Ahmedabad", state: "Gujarat" },
    { city: "Jaipur", state: "Rajasthan" },
    { city: "Surat", state: "Gujarat" },
    { city: "Lucknow", state: "Uttar Pradesh" },
    { city: "Kochi", state: "Kerala" },
];

export default function LocationSelector() {
    const { showSelector, setCity, closeSelector } = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedState, setSelectedState] = useState<string | null>(null);

    if (!showSelector) return null;

    const handleCitySelect = (city: string, state: string) => {
        setCity(city, state);
    };

    // Filter cities based on search
    const getFilteredCities = () => {
        if (!searchQuery) return [];

        const results: Array<{ city: string; state: string }> = [];
        Object.entries(INDIAN_LOCATIONS).forEach(([state, cities]) => {
            cities.forEach((city) => {
                if (
                    city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    state.toLowerCase().includes(searchQuery.toLowerCase())
                ) {
                    results.push({ city, state });
                }
            });
        });
        return results.slice(0, 15);
    };

    const filteredCities = getFilteredCities();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeSelector}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Select Your Location
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Choose your city to see events near you
                        </p>
                    </div>
                    <button
                        onClick={closeSelector}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                    {/* Search */}
                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for your city..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            autoFocus
                        />
                    </div>

                    {/* Search Results */}
                    {searchQuery && filteredCities.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                Search Results
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {filteredCities.map((location, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() =>
                                            handleCitySelect(location.city, location.state)
                                        }
                                        className="flex items-center space-x-2 px-4 py-3 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
                                    >
                                        <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {location.city}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {location.state}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Popular Cities */}
                    {!searchQuery && (
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                Popular Cities
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {POPULAR_CITIES.map((location, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() =>
                                            handleCitySelect(location.city, location.state)
                                        }
                                        className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
                                    >
                                        <MapPin className="w-6 h-6 text-gray-400 group-hover:text-purple-600 mb-2" />
                                        <p className="text-sm font-medium text-gray-900">
                                            {location.city}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {location.state}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All States & Cities */}
                    {!searchQuery && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                All Cities by State ({Object.keys(INDIAN_LOCATIONS).length} States)
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(INDIAN_LOCATIONS).map(([state, cities]) => (
                                    <div key={state}>
                                        <button
                                            onClick={() =>
                                                setSelectedState(selectedState === state ? null : state)
                                            }
                                            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <span className="font-medium text-gray-900">{state}</span>
                                            <span className="text-sm text-gray-500">
                                                {cities.length} cities
                                            </span>
                                        </button>

                                        {selectedState === state && (
                                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 pl-4">
                                                {cities.map((city) => (
                                                    <button
                                                        key={city}
                                                        onClick={() => handleCitySelect(city, state)}
                                                        className="px-3 py-2 text-sm text-left border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                                                    >
                                                        {city}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
