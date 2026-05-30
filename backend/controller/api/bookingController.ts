import type { Request, Response } from 'express';
import prisma from '../../src/lib/prisma.js';
import { getBestDriverMatch } from '../../service/aiMatchingService.js';

export const matchDriversForCar = async (req: Request, res: Response) => {
  try {
    // Step 1: Database Fetching
    // carId နှင့် ownerTownship ကို Request Body မှ လက်ခံခြင်း
    const { carId, ownerTownship } = req.body;

    if (!carId || !ownerTownship) {
      return res.status(400).json({ error: 'carId and ownerTownship are required' });
    }

    // Prisma ဖြင့် ထိုကားအတွက် လျှောက်ထားသော Driver များကို DB မှ ဖတ်ခြင်း
    // driver ၏ name, township, experience_years သာ select လုပ်၍ sensitive data ကို DB level မှ ပင် ဖယ်ရှားထားသည်
    const applications = await prisma.carApplication.findMany({
      where: { carId: String(carId) },
      select: {
        id: true,
        driver: {
          select: {
            // ✅ Safe fields only — ကိုယ်ရေးအချက်အလက်များ DB ထဲမှ မဖတ်ဘဲ ချန်ထားသည်
            name: true,
            township: true,
            driverLicense: {
              select: {
                yearsExperience: true,
              },
            },
            receivedReviews: {
              select: {
                rating: true,
              },
            },
          },
        },
      },
    });

    if (applications.length === 0) {
      return res.status(200).json({
        success: true,
        data: { ranked_applicants: [] },
        message: 'No applicants found for this car.',
      });
    }

    // Step 2: Data Sanitization (Security Focus)
    // Raw DB object ကို AI ဆီ မပို့ဘဲ လုံခြုံသော field များသာ ထုတ်ယူ၍ စစ်ထုတ်ခြင်း
    const cleanApplicants = applications.map((app) => {
      // Average rating တွက်ချက်ခြင်း (review မရှိပါက default 4.5)
      const reviews = app.driver.receivedReviews;
      const averageRating =
        reviews.length > 0
          ? parseFloat(
              (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            )
          : 4.5;

      // Experience years (driver license မရှိပါက default 1)
      const experienceYears = app.driver.driverLicense?.yearsExperience ?? 1;

      // ✅ AI ဆီ ပို့မည့် Safe fields သာ ပါဝင်သည် — phone, nrc, email, password မပါဝင်
      return {
        name: app.driver.name,
        township: app.driver.township ?? 'Unknown',
        average_rating: averageRating,
        experience_years: experienceYears,
      };
    });

    // Step 3: AI Integration
    // သန့်ရှင်းပြီးသော Data ကိုသာ Groq AI Service ဆီ ပေးပို့ခြင်း
    console.log("Applicants going to AI:", cleanApplicants);
    const aiResult = await getBestDriverMatch(ownerTownship, cleanApplicants);

    // Step 4: Success Response
    return res.status(200).json({ success: true, data: aiResult });

  } catch (error: unknown) {
    // Error ကို Terminal မှာသာ Log ထုတ်ပြ၍ Frontend ဆီ Sensitive info မပေးပို့ဘဲ
    // ယေဘူယျ Error message သာ ပြန်ပေးခြင်း (Security Best Practice)
    console.error('[matchDriversForCar] Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
