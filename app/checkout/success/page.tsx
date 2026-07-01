// app/checkout/success/page.tsx
import Link from 'next/link';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

export default function CheckoutSuccessPage() {
  return (
    <>
      <Header />
      <main dir="rtl" className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-green-700 mb-4">✅ تم استلام طلبك بنجاح</h1>
        <p className="text-gray-600 mb-8">سيتواصل معك فريقنا قريباً لتأكيد الطلب والتسليم.</p>
        <Link href="/products" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg">متابعة التسوق</Link>
      </main>
      <Footer />
    </>
  );
}
