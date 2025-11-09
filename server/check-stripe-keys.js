require('dotenv').config();

console.log('Environment variables check:');
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('STRIPE_SECRET_KEY starts with sk_test_:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_'));
console.log('STRIPE_PUBLISHABLE_KEY exists:', !!process.env.STRIPE_PUBLISHABLE_KEY);
console.log('STRIPE_PUBLISHABLE_KEY starts with pk_test_:', process.env.STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_'));

if (process.env.STRIPE_SECRET_KEY) {
  console.log('\n✅ Stripe keys are loaded correctly');
} else {
  console.log('\n❌ Stripe keys are NOT loaded. Check your .env file');
}
