
import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const formattedTime = time.toLocaleTimeString('ar-EG', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
    });

    const formattedDate = time.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="text-center text-white">
            <div className="text-4xl md:text-6xl font-bold tracking-wider">{formattedTime}</div>
            <div className="text-lg md:text-xl mt-2">{formattedDate}</div>
        </div>
    );
};

export const Header: React.FC = () => {
    return (
        <header className="bg-header-gradient text-white p-6 shadow-2xl no-print">
            <div className="container mx-auto text-center">
                <h1 className="text-3xl md:text-5xl font-extrabold text-[#D4AF37] drop-shadow-lg">
                    مديرية مرور محافظة الانبار
                </h1>
                <h2 className="text-2xl md:text-4xl font-semibold mt-2">
                    شعبة التخطيط والمتابعة
                </h2>
                <div className="my-6">
                    <Clock />
                </div>
                <p className="text-2xl md:text-3xl font-bold">الاستاذ غازي حمد مصلح</p>
            </div>
        </header>
    );
};
