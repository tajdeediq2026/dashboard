"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUpperArticle } from "../../articles/lib/api";
import { CreateUpperArticleDto } from "../../articles/types/UpperArticle";
import { toast } from "react-hot-toast";

export default function AddUpperArticle() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateUpperArticleDto>({
    upperArticleName: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.upperArticleName.trim()) {
      newErrors.upperArticleName = "اسم المقال العلوي مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة", {
        position: "bottom-center",
        duration: 3000,
        style: {
          background: "#EF4444",
          color: "#fff",
          direction: "rtl",
        },
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createUpperArticle(formData);

      toast.success("تم إنشاء المقال العلوي بنجاح", {
        position: "bottom-center",
        duration: 3000,
        style: {
          background: "#10B981",
          color: "#fff",
          direction: "rtl",
        },
      });

      // Redirect after successful creation
      setTimeout(() => {
        router.push("/dashboard/upper-articles");
      }, 1500);
    } catch (error) {
      console.error("Error creating upper article:", error);
      toast.error("فشل في إنشاء المقال العلوي", {
        position: "bottom-center",
        duration: 3000,
        style: {
          background: "#EF4444",
          color: "#fff",
          direction: "rtl",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          رجوع
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">
          إضافة مقال علوي جديد
        </h1>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="upperArticleName"
              className="block text-sm font-medium text-gray-700 text-right"
            >
              اسم المقال العلوي *
            </label>
            <input
              type="text"
              id="upperArticleName"
              name="upperArticleName"
              value={formData.upperArticleName}
              onChange={handleInputChange}
              className={`mt-1 block w-full border ${
                errors.upperArticleName ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-custom-green focus:border-custom-green text-right text-black`}
              placeholder="أدخل اسم المقال العلوي"
            />
            {errors.upperArticleName && (
              <p className="mt-1 text-sm text-red-600 text-right">
                {errors.upperArticleName}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-custom-green hover:bg-custom-green-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-green ${
                isSubmitting ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "جاري الإضافة..." : "إضافة المقال العلوي"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
