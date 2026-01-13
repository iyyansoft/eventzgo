import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { gstNumber } = await request.json();

        // Validate GST number
        if (!gstNumber || gstNumber.length !== 15) {
            return NextResponse.json(
                { error: 'Invalid GST number. Must be 15 characters.' },
                { status: 400 }
            );
        }

        // Validate GST format
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstRegex.test(gstNumber)) {
            return NextResponse.json(
                { error: 'Invalid GST number format' },
                { status: 400 }
            );
        }

        // Extract PAN from GST
        const panNumber = gstNumber.substring(2, 12);
        const stateCode = gstNumber.substring(0, 2);
        const state = getStateName(stateCode);

        // Check which API provider is configured
        const hasRapidAPI = !!process.env.RAPIDAPI_KEY;

        console.log('🔍 API Provider Check:');
        console.log('  - RapidAPI:', hasRapidAPI ? '✅ Configured' : '❌ Not configured');

        // ========== OPTION 1: RapidAPI GST Verification ==========
        if (hasRapidAPI) {
            console.log('🚀 Using RapidAPI for GST verification...');

            try {
                const apiKey = process.env.RAPIDAPI_KEY!;
                console.log('📝 API Key configured:', apiKey.substring(0, 10) + '...');

                // Using GST Verification API (IDfy) - More reliable
                const response = await fetch('https://gst-verification.p.rapidapi.com/v3/tasks/sync/verify_with_source/ind_gst_certificate', {
                    method: 'POST',
                    headers: {
                        'x-rapidapi-key': apiKey,
                        'x-rapidapi-host': 'gst-verification.p.rapidapi.com',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        task_id: `gst_${Date.now()}`,
                        group_id: `group_${Date.now()}`,
                        data: {
                            gstin: gstNumber
                        }
                    })
                });

                console.log('📡 RapidAPI Response Status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ RapidAPI Error:', errorText);

                    // If API fails, fall back to mock data
                    throw new Error(`API returned ${response.status}`);
                }

                const result = await response.json();
                console.log('✅ RapidAPI Response:', JSON.stringify(result, null, 2));

                // Extract data from IDfy response format
                if (result.status === 'completed' && result.result) {
                    const sourceOutput = result.result.source_output || result.result;
                    const principalAddress = sourceOutput.principal_place_of_business_fields?.principal_place_of_business_address || {};

                    const responseData = {
                        gstNumber: sourceOutput.gstin || gstNumber,
                        legalName: sourceOutput.trade_name || sourceOutput.legal_name || 'Company Name Not Available',
                        tradeName: sourceOutput.legal_name || sourceOutput.trade_name || 'Trade Name Not Available',
                        address: {
                            street: [
                                principalAddress.door_number,
                                principalAddress.street,
                                principalAddress.location
                            ].filter(Boolean).join(', ') || '',
                            city: principalAddress.dst || principalAddress.city || '',
                            state: principalAddress.state_name || state,
                            pincode: principalAddress.pincode || ''
                        },
                        panNumber: panNumber,
                        registrationDate: sourceOutput.date_of_registration || '',
                        status: sourceOutput.gstin_status || 'Active',
                        taxpayerType: sourceOutput.taxpayer_type || sourceOutput.constitution_of_business || 'Regular',
                        verified: true,
                        source: 'RapidAPI'
                    };

                    console.log('📤 Sending response:', JSON.stringify(responseData, null, 2));

                    return NextResponse.json({
                        success: true,
                        data: responseData
                    });
                } else {
                    throw new Error('Invalid response format from API');
                }

            } catch (apiError: any) {
                console.error('❌ RapidAPI Error:', apiError.message);

                // Fall back to mock data
                console.log('⚠️ Falling back to mock data due to API error');
            }
        }

        // ========== FALLBACK: Smart Mock Data ==========
        console.log('⚠️ Using intelligent mock data');
        console.log('📝 To use real GST verification:');
        console.log('   1. Sign up at https://rapidapi.com/');
        console.log('   2. Subscribe to "GST Verification" API');
        console.log('   3. Add RAPIDAPI_KEY to .env.local');

        return NextResponse.json({
            success: true,
            data: {
                gstNumber: gstNumber,
                legalName: `COMPANY NAME AS PER GST - ${gstNumber.substring(2, 7).toUpperCase()}`,
                tradeName: `Trade Name ${gstNumber.substring(2, 7)}`,
                address: {
                    street: "GST Registered Address",
                    city: "City Name",
                    state: state,
                    pincode: "000000"
                },
                panNumber: panNumber,
                registrationDate: "2020-01-15",
                status: "Active",
                taxpayerType: "Regular",
                verified: false,
                source: 'Mock',
                warning: '⚠️ This is mock data. Add RAPIDAPI_KEY to .env.local for real verification.'
            },
            warning: 'Using mock data. Configure RapidAPI for real GST verification.'
        });

    } catch (error: any) {
        console.error('💥 GST verification error:', error);
        return NextResponse.json(
            { error: 'Failed to verify GST number', details: error.message },
            { status: 500 }
        );
    }
}

// Helper function to get state name from code
function getStateName(stateCode: string): string {
    const stateMap: Record<string, string> = {
        '01': 'Jammu and Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh',
        '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan',
        '09': 'Uttar Pradesh', '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
        '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram', '16': 'Tripura',
        '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal', '20': 'Jharkhand',
        '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
        '25': 'Daman and Diu', '26': 'Dadra and Nagar Haveli', '27': 'Maharashtra',
        '28': 'Andhra Pradesh', '29': 'Karnataka', '30': 'Goa', '31': 'Lakshadweep',
        '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry',
        '35': 'Andaman and Nicobar Islands', '36': 'Telangana', '37': 'Andhra Pradesh',
        '38': 'Ladakh'
    };
    return stateMap[stateCode] || 'Unknown';
}
