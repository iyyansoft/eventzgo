import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const ifscCode = searchParams.get('ifsc');

        if (!ifscCode || ifscCode.length !== 11) {
            return NextResponse.json(
                { error: 'Invalid IFSC code. Must be 11 characters.' },
                { status: 400 }
            );
        }

        // Validate IFSC format (4 letters + 0 + 6 alphanumeric)
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        if (!ifscRegex.test(ifscCode)) {
            return NextResponse.json(
                { error: 'Invalid IFSC code format' },
                { status: 400 }
            );
        }

        console.log('🏦 Fetching bank details for IFSC:', ifscCode);

        try {
            // Using free IFSC API
            const response = await fetch(`https://ifsc.razorpay.com/${ifscCode}`);

            if (!response.ok) {
                if (response.status === 404) {
                    return NextResponse.json(
                        { error: 'IFSC code not found' },
                        { status: 404 }
                    );
                }
                throw new Error(`API returned ${response.status}`);
            }

            const bankData = await response.json();
            console.log('✅ Bank data fetched:', bankData);

            return NextResponse.json({
                success: true,
                data: {
                    ifsc: bankData.IFSC,
                    bank: bankData.BANK,
                    branch: bankData.BRANCH,
                    address: bankData.ADDRESS,
                    city: bankData.CITY,
                    district: bankData.DISTRICT,
                    state: bankData.STATE,
                    contact: bankData.CONTACT,
                    micr: bankData.MICR,
                    verified: true
                }
            });

        } catch (apiError: any) {
            console.error('❌ IFSC API Error:', apiError);
            return NextResponse.json(
                { error: 'Failed to fetch bank details', details: apiError.message },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error('💥 IFSC verification error:', error);
        return NextResponse.json(
            { error: 'Failed to verify IFSC code', details: error.message },
            { status: 500 }
        );
    }
}
