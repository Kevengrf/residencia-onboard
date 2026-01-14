'use client'

export function ColorfulGrid() {
    return (
        <div className="absolute inset-0 z-0 grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 grid-rows-6 opacity-90 pointer-events-none">
            {/* We will place colored squares at random-looking but fixed positions to mimic the reference image */}

            {/* Row 1 */}
            <div className="col-start-4 row-start-1 bg-white/0" /> {/* Spacer */}
            <div className="col-start-11 row-start-1 bg-[#E31C58] hidden lg:block" /> {/* Red Top Right */}

            {/* Row 2 */}
            <div className="col-start-9 row-start-2 bg-white hidden lg:block" /> {/* White */}
            <div className="col-start-11 row-start-2 bg-[#E31C58] hidden lg:block" /> {/* Red below first red? Image is cropped, lets guess */}

            {/* Row 3 - The main cluster from image */}
            <div className="col-start-2 row-start-3 bg-[#E31C58] md:block hidden" /> {/* Red Left */}
            <div className="col-start-11 row-start-3 bg-[#2D5BFF] hidden lg:block" /> {/* Blue Right */}

            {/* Row 4 */}
            <div className="col-start-11 row-start-4 bg-white hidden lg:block" /> {/* White */}
            <div className="col-start-12 row-start-4 bg-[#E31C58] hidden lg:block" /> {/* Red */}

            {/* Row 5 */}
            <div className="col-start-8 row-start-5 bg-[#00C853] hidden lg:block" /> {/* Green */}
            <div className="col-start-12 row-start-5 bg-[#2D5BFF] hidden lg:block" /> {/* Blue */}

            {/* Row 6 */}
            <div className="col-start-9 row-start-6 bg-[#E31C58] hidden lg:block" /> {/* Red Bottom */}

            {/* Mobile/Tablet Simplified Squares */}
            <div className="col-start-4 row-start-2 bg-[#E31C58] lg:hidden block opacity-80" />
            <div className="col-start-1 row-start-4 bg-[#2D5BFF] lg:hidden block opacity-80" />
            <div className="col-start-3 row-start-5 bg-[#00C853] lg:hidden block opacity-80" />
        </div>
    )
}
