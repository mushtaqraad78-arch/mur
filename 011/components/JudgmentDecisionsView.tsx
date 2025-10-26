import React, { useState, useRef, useEffect } from 'react';
import type { JudgmentDecision } from '../types';
import { ActionButton, SuccessOverlay } from './SharedComponents';
import { useToast } from './Toast';

interface JudgmentDecisionsViewProps {
    contextName: string;
    initialDecisions: JudgmentDecision[];
    onSaveDecisions: (decisions: JudgmentDecision[]) => void;
}

export const JudgmentDecisionsView: React.FC<JudgmentDecisionsViewProps> = ({ contextName, initialDecisions, onSaveDecisions }) => {
    const [decisions, setDecisions] = useState<JudgmentDecision[]>(initialDecisions);
    const [newDecision, setNewDecision] = useState<Omit<JudgmentDecision, 'id'>>({
        decisionText: '',
        violatorName: '',
        fineAmount: 0,
        violationDate: new Date().toISOString().split('T')[0],
        photoPreviewUrl: ''
    });
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { addToast } = useToast();
    const [isAdding, setIsAdding] = useState(false);
    const [isSavingAll, setIsSavingAll] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    useEffect(() => {
        setDecisions(initialDecisions);
    }, [initialDecisions]);


    const handleInputChange = (field: keyof typeof newDecision, value: string | number) => {
        setNewDecision(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewDecision(prev => ({ ...prev, photoPreviewUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddDecision = () => {
        if (!newDecision.decisionText || !newDecision.violatorName) {
            addToast('يرجى ملء حقلي نص القرار واسم المخالف.', 'error');
            return;
        }
        setIsAdding(true);
        setTimeout(() => {
            const decisionToAdd: JudgmentDecision = {
                id: new Date().toISOString(),
                ...newDecision,
            };
            const updatedDecisions = [...decisions, decisionToAdd];
            setDecisions(updatedDecisions);
            onSaveDecisions(updatedDecisions);
            
            setSuccessMessage('تمت إضافة القرار بنجاح!');
            setShowSuccess(true);
            setIsAdding(false);
            
            setTimeout(() => {
                setShowSuccess(false);
                // Reset form
                setNewDecision({
                    decisionText: '',
                    violatorName: '',
                    fineAmount: 0,
                    violationDate: new Date().toISOString().split('T')[0],
                    photoPreviewUrl: ''
                });
            }, 1500);
        }, 500);
    };
    
    const handleSaveAll = () => {
        setIsSavingAll(true);
        setTimeout(() => {
            onSaveDecisions(decisions);
            setSuccessMessage(`تم حفظ جميع قرارات الحكم لـ ${contextName} بنجاح!`);
            setShowSuccess(true);
            setIsSavingAll(false);
            setTimeout(() => setShowSuccess(false), 1500);
        }, 1000);
    };

    const openCamera = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // Ideal constraints: prefer rear camera for scanning
            const rearCameraConstraints = { video: { facingMode: "environment" } };
            // Fallback constraints: any camera
            const anyCameraConstraints = { video: true };

            const tryStream = async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
                 return navigator.mediaDevices.getUserMedia(constraints);
            }

            try {
                let stream;
                try {
                    // First, try to get the rear camera
                    stream = await tryStream(rearCameraConstraints);
                } catch (e) {
                    // If that fails, try any available camera
                    console.warn("Rear camera not found or failed, trying any camera...");
                    stream = await tryStream(anyCameraConstraints);
                }
                
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setIsCameraOpen(true);
                }
            } catch (err) {
                 if (err instanceof DOMException) {
                    switch(err.name) {
                        case 'NotFoundError':
                            addToast("لم يتم العثور على كاميرا. يرجى التأكد من أن جهازك يحتوي على كاميرا.", 'error');
                            break;
                        case 'NotAllowedError':
                        case 'PermissionDeniedError':
                             addToast("تم رفض الوصول إلى الكاميرا. يرجى تمكين الإذن في إعدادات المتصفح.", 'error');
                             break;
                        case 'NotReadableError':
                            addToast("لا يمكن قراءة الكاميرا. قد تكون قيد الاستخدام بواسطة تطبيق آخر.", 'error');
                            break;
                        default:
                            console.error("Error accessing camera: ", err);
                            addToast("حدث خطأ غير متوقع أثناء الوصول إلى الكاميرا.", 'error');
                    }
                } else {
                     console.error("An unexpected error occurred while accessing the camera: ", err);
                     addToast("حدث خطأ غير متوقع أثناء محاولة الوصول إلى الكاميرا.", 'error');
                }
            }
        } else {
            addToast("المتصفح لا يدعم الوصول إلى الكاميرا.", 'error');
        }
    };

    const closeCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setNewDecision(prev => ({ ...prev, photoPreviewUrl: dataUrl }));
            }
        }
        closeCamera();
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg">
            <SuccessOverlay show={showSuccess} message={successMessage} />
            <h3 className="text-2xl font-bold text-center mb-4 text-[#0A1A3D]">إرفاق صور قرارات الحكم - {contextName}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg mb-6">
                <div>
                    <label className="block font-bold mb-1">نص القرار</label>
                    <textarea value={newDecision.decisionText} onChange={e => handleInputChange('decisionText', e.target.value)} className="w-full p-2 border rounded" rows={3}></textarea>
                </div>
                <div>
                    <label className="block font-bold mb-1">اسم المخالف</label>
                    <input type="text" value={newDecision.violatorName} onChange={e => handleInputChange('violatorName', e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label className="block font-bold mb-1">قيمة المخالفة</label>
                    <input type="number" value={newDecision.fineAmount} onChange={e => handleInputChange('fineAmount', parseInt(e.target.value) || 0)} className="w-full p-2 border rounded" />
                </div>
                 <div>
                    <label className="block font-bold mb-1">تاريخ المخالفة</label>
                    <input type="date" value={newDecision.violationDate} onChange={e => handleInputChange('violationDate', e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div className="md:col-span-2">
                    <label className="block font-bold mb-1">إرفاق صورة القرار (Scan or Upload)</label>
                    <div className="flex items-center gap-4">
                        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-2 border rounded" />
                        <ActionButton icon="lucide-camera" text="Scan" onClick={openCamera} colorClass="bg-teal-500 text-white hover:bg-teal-600"/>
                    </div>
                     {newDecision.photoPreviewUrl && <img src={newDecision.photoPreviewUrl} alt="Preview" className="mt-2 h-24 w-auto rounded" />}
                </div>
                <div className="md:col-span-2 flex justify-center">
                    <ActionButton icon="lucide-save" text="إضافة وحفظ القرار" onClick={handleAddDecision} isLoading={isAdding} colorClass="bg-green-500 text-white hover:bg-green-600" />
                </div>
            </div>

            <h4 className="text-xl font-bold mb-2">القرارات المحفوظة</h4>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                    <thead className="bg-[#0A1A3D] text-white">
                        <tr>
                            <th className="py-2 px-2 border-b">نص القرار</th>
                            <th className="py-2 px-2 border-b">اسم المخالف</th>
                            <th className="py-2 px-2 border-b">قيمة المخالفة</th>
                            <th className="py-2 px-2 border-b">تاريخ المخالفة</th>
                            <th className="py-2 px-2 border-b">صورة القرار</th>
                        </tr>
                    </thead>
                    <tbody>
                        {decisions.length > 0 ? decisions.map(d => (
                            <tr key={d.id} className="text-center">
                                <td className="py-2 px-2 border-b">{d.decisionText}</td>
                                <td className="py-2 px-2 border-b">{d.violatorName}</td>
                                <td className="py-2 px-2 border-b">{d.fineAmount.toLocaleString()}</td>
                                <td className="py-2 px-2 border-b">{d.violationDate}</td>
                                <td className="py-2 px-2 border-b">
                                    {d.photoPreviewUrl ? <img src={d.photoPreviewUrl} alt="Decision" className="h-16 w-auto mx-auto rounded" /> : 'لا توجد صورة'}
                                </td>
                            </tr>
                        )) : (
                             <tr><td colSpan={5} className="text-center py-4">لا توجد قرارات محفوظة.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
             {isCameraOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 no-print">
                    <div className="bg-white p-4 rounded-lg max-w-3xl w-full">
                        <h4 className="text-xl font-bold mb-4 text-center">التقاط صورة</h4>
                        <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg mb-4 h-auto max-h-[60vh]"></video>
                        <canvas ref={canvasRef} className="hidden"></canvas>
                        <div className="flex justify-center gap-4">
                            <ActionButton icon="lucide-camera" text="التقاط" onClick={capturePhoto} colorClass="bg-green-500 text-white"/>
                            <ActionButton icon="lucide-x" text="إلغاء" onClick={closeCamera} colorClass="bg-red-500 text-white"/>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex justify-center mt-6 no-print">
                 <ActionButton icon="lucide-save" text="حفظ جميع التغييرات" onClick={handleSaveAll} isLoading={isSavingAll} colorClass="bg-red-500 text-white hover:bg-red-600" />
            </div>
        </div>
    );
};