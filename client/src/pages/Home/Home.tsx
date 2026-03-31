import { Hero } from '../../components/sections/Hero';
import { Categories } from '../../components/sections/Categories';
import { Advantages } from '../../components/sections/Advantages';
import { HowItWorks } from '../../components/sections/HowItWorks';
import { TopMasters } from '../../components/sections/TopMasters';
import { Statistics } from '../../components/sections/Statistics';
import { Portfolio } from '../../components/sections/Portfolio';
import { Testimonials } from '../../components/sections/Testimonials';
import { Blog } from '../../components/sections/Blog';
import { CTA } from '../../components/sections/CTA';
import { Footer } from '../../components/Footer/Footer';

export const HomePage = () => {
  return (
    <>
      <Hero />
      <Categories />
      <Advantages />
      <HowItWorks />
      <TopMasters />
      <Statistics />
      <Portfolio />
      <Testimonials />
      <Blog />
      <CTA />
      <Footer />
    </>
  );
};
