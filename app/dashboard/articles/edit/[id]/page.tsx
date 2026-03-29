"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArticleCreate } from "../../types/Article";
import { CategoryAll } from "../../types/Category";
import { Tag } from "../../types/Tag";
import { UpperArticle as BaseUpperArticle } from "../../types/UpperArticle";
import { getBackendBaseUrl } from '@/lib/backend-url';

type UpperArticle = BaseUpperArticle & {
  assignedArticleTitle?: string | null;
  isAvailable?: boolean;
};
import Image from "next/image";
import { getCategories, getTags, getUpperArticles, getArticles, updateArticle } from "../../lib/api";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const CKEDITOR_LICENSE_KEY = process.env.NEXT_PUBLIC_CKEDITOR_LICENSE_KEY || "GPL";

export default function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryAll[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [upperArticles, setUpperArticles] = useState<UpperArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ArticleCreate>({
    articleTitle: "",
    articleSummary: "",
    articleContent: "",
    content: "",
    isPublished: false,
    editorChoice: false,
    facebook: false,
    twitter: false,
    categoryId: {
      id: 0,
      name: "",
    },
    tagId: undefined,
    upperArticleId: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch article data
        const articleResponse = await fetch(`/api/backend/Articles/${id}`);
        if (!articleResponse.ok) {
          throw new Error(`HTTP error! status: ${articleResponse.status}`);
        }
        const articleData = await articleResponse.json();
        // Fetch all related data in parallel
        const [categoriesData, tagsData, allUpperArticlesData, allArticlesData] = await Promise.all([
          getCategories(),
          getTags(),
          getUpperArticles(),
          getArticles() // Get all articles to show current assignments
        ]);
        
        if (Array.isArray(categoriesData)) setCategories(categoriesData);
        if (Array.isArray(tagsData)) setTags(tagsData);
        
        // Enrich UpperArticles with current assignment information (excluding current article)
        if (Array.isArray(allUpperArticlesData)) {
          const upperArticlesWithAssignments = allUpperArticlesData.map(upperArticle => {
            const assignedArticle = allArticlesData.find(article => 
              article.upperArticleId === upperArticle.upperArticleId && article.id !== id
            );
            return {
              ...upperArticle,
              assignedArticleTitle: assignedArticle ? assignedArticle.articleTitle : null,
              isAvailable: !assignedArticle
            };
          });
          
          setUpperArticles(upperArticlesWithAssignments);
        }
        // Handle category ID
        let categoryId = { id: 0, name: '' };
        if (articleData.category) {
          categoryId = {
            id: articleData.category.id || 0,
            name: articleData.category.name || ''
          };
        } else if (articleData.categoryId && Array.isArray(categoriesData)) {
          const foundCategory = categoriesData.find(cat => cat.id === articleData.categoryId);
          if (foundCategory) {
            categoryId = {
              id: foundCategory.id,
              name: foundCategory.name
            };
          }
        }
        setFormData({
          articleTitle: articleData.articleTitle || '',
          articleSummary: articleData.articleSummary || '',
          articleContent: articleData.articleContent || '',
          content: articleData.content || '',
          isPublished: articleData.isPublished ?? false,
          editorChoice: articleData.editorChoice ?? false,
          facebook: articleData.facebook ?? false,
          twitter: articleData.twitter ?? false,
          categoryId: categoryId,
          tagId: articleData.tagId ?? undefined,
          upperArticleId: articleData.upperArticleId ?? undefined,
        });
        
        // Set current image if exists
        if (articleData.imagePath) {
          try {
            // Handle both absolute and relative paths
            let imageUrl = articleData.imagePath;
            if (!imageUrl.startsWith('http')) {
              // If it's a relative path, prepend the base URL
              const backendBase = getBackendBaseUrl();
              imageUrl = imageUrl.startsWith('/') 
                ? `${backendBase}${imageUrl}` 
                : `${backendBase}/${imageUrl}`;
            }
            setCurrentImage(imageUrl);
          } catch (error) {
            console.error('Error setting current image:', error);
            setCurrentImage(null);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("فشل في تحميل البيانات", {
          position: "bottom-center",
          duration: 3000,
          style: {
            background: "#EF4444",
            color: "#fff",
            direction: "rtl",
          },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (name === "categoryId") {
      const selectedCategory = categories.find(
        (cat) => cat.id === Number(value)
      );
      setFormData((prev) => ({
        ...prev,
        categoryId: selectedCategory
          ? { id: selectedCategory.id, name: selectedCategory.name }
          : { id: 0, name: "" },
      }));
    } else if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === "tagId" || name === "upperArticleId") {
      // Convert to number, or undefined if empty (undefined will be converted to 0 in API)
      setFormData((prev) => ({
        ...prev,
        [name]: value ? Number(value) : undefined,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("يرجى اختيار ملف صورة صالح", {
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
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("حجم الملف يجب أن يكون أقل من 10 ميجابايت", {
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
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.articleTitle.trim()) {
      newErrors.articleTitle = "عنوان المقال مطلوب";
    }
    if (!formData.articleContent.trim()) {
      newErrors.articleContent = "محتوى المقال مطلوب";
    }
    if (!formData.articleSummary.trim()) {
      newErrors.articleSummary = "ملخص المقال مطلوب";
    }
    if (!formData.categoryId.id) {
      newErrors.categoryId = "يرجى اختيار تصنيف";
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
      console.log('Form data before submission:', {
        upperArticleId: formData.upperArticleId,
        tagId: formData.tagId,
        categoryId: formData.categoryId.id
      });

      const articleData: ArticleCreate = {
        ...formData,
        // Ensure proper handling of UpperArticle removal
        upperArticleId: formData.upperArticleId === null || formData.upperArticleId === undefined
          ? 0
          : formData.upperArticleId,
        createdDate: new Date()
      };

      console.log('Article data being sent to API:', {
        upperArticleId: articleData.upperArticleId,
        tagId: articleData.tagId,
        categoryId: articleData.categoryId.id
      });

      await updateArticle(id, articleData, selectedFile || undefined);
      toast.success("تم تحديث المقال بنجاح", {
        position: "bottom-center",
        duration: 3000,
        style: {
          background: "#10B981",
          color: "#fff",
          direction: "rtl",
        },
      });
      setTimeout(() => {
        router.push("/dashboard/articles");
      }, 1500);
    } catch (error) {
      console.error("Error updating article:", error);
      
      // Check if it's an upper article conflict error
      let errorMessage = "فشل في تحديث المقال";
      if (error instanceof Error && error.message.includes("already linked")) {
        errorMessage = "المقال العلوي المحدد مربوط بالفعل بمقال آخر. يرجى اختيار مقال علوي آخر أو إزالته.";
      } else if (error instanceof Error && error.message.includes("UpperArticle")) {
        errorMessage = "خطأ في المقال العلوي المحدد. يرجى التحقق من الاختيار.";
      }
      
      toast.error(errorMessage, {
        position: "bottom-center",
        duration: 5000,
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

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
            <button
              onClick={() => router.back()}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm sm:text-base"
            >
              رجوع
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
              تعديل المقال
            </h1>
          </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <label htmlFor="articleTitle" className="block text-sm font-medium text-gray-700 text-right mb-2">عنوان المقال</label>
              <input type="text" id="articleTitle" name="articleTitle" value={formData.articleTitle} onChange={handleInputChange} className={`w-full border ${errors.articleTitle ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right text-black text-sm sm:text-base`} />
              {errors.articleTitle && (<p className="mt-1 text-sm text-red-600 text-right">{errors.articleTitle}</p>)}
            </div>
            <div className="lg:col-span-2">
              <label htmlFor="articleSummary" className="block text-sm font-medium text-gray-700 text-right mb-2">ملخص المقال</label>
              <textarea id="articleSummary" name="articleSummary" rows={3} value={formData.articleSummary} onChange={handleInputChange} className={`w-full border ${errors.articleSummary ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right text-black text-sm sm:text-base resize-y`} />
              {errors.articleSummary && (<p className="mt-1 text-sm text-red-600 text-right">{errors.articleSummary}</p>)}
            </div>
            <div className="lg:col-span-2">
              <label htmlFor="articleContent" className="block text-sm font-medium text-gray-700 text-right mb-2">محتوى المقال</label>
              <div className={`${errors.articleContent ? 'border-2 border-red-500 rounded-md' : ''} overflow-hidden`}>
                <CKEditor editor={ClassicEditor} data={formData.articleContent} onChange={(event, editor) => {
                  const editorInstance = editor as { getData: () => string };
                  const data = editorInstance.getData();
                  setFormData((prev) => ({ ...prev, articleContent: data }));
                  if (errors.articleContent) {
                    setErrors((prev) => { const newErrors = { ...prev }; delete newErrors.articleContent; return newErrors; });
                  }
                }} config={{ licenseKey: CKEDITOR_LICENSE_KEY, language: 'ar', removePlugins: ['Title'], toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'indent', 'outdent', '|', 'blockQuote', 'insertTable', 'undo', 'redo'] }} />
              </div>
              {errors.articleContent && (<p className="mt-1 text-sm text-red-600 text-right">{errors.articleContent}</p>)}
            </div>
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 text-right mb-2">التصنيف</label>
              <select id="categoryId" name="categoryId" value={formData.categoryId.id || ""} onChange={handleInputChange} className={`w-full border ${errors.categoryId ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right text-black text-sm sm:text-base`} disabled={loading}>
                <option value="">اختر تصنيف</option>
                {categories.map((category) => (<option key={category.id} value={category.id}>{category.name}</option>))}
              </select>
              {errors.categoryId && (<p className="mt-1 text-sm text-red-600 text-right">{errors.categoryId}</p>)}
            </div>
            <div>
              <label htmlFor="tagId" className="block text-sm font-medium text-gray-700 text-right mb-2">الوسم</label>
              <select id="tagId" name="tagId" value={formData.tagId || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right text-black text-sm sm:text-base" disabled={loading}>
                <option value="">اختر وسم</option>
                {tags.map((tag) => (<option key={tag.tagId} value={tag.tagId}>{tag.tagName}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="upperArticleId" className="block text-sm font-medium text-gray-700 text-right mb-2">
                المقال العلوي
                <span className="text-xs text-gray-500 block mt-1">
                  (يمكن إعادة تعيين المقالات العلوية المستخدمة)
                </span>
              </label>
              <select id="upperArticleId" name="upperArticleId" value={formData.upperArticleId || ""} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right text-black text-sm sm:text-base" disabled={loading}>
                <option value="">اختر مقال علوي</option>
                {upperArticles.map((upperArticle) => (
                  <option key={upperArticle.upperArticleId} value={upperArticle.upperArticleId}>
                    {upperArticle.upperArticleName}
                    {upperArticle.assignedArticleTitle ? ` (مستخدم في: ${upperArticle.assignedArticleTitle})` : ' (متاح)'}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-blue-600 text-right">
                يمكنك إعادة تعيين المقالات العلوية المستخدمة بالفعل. سيتم نقل التعيين من المقال السابق إلى هذا المقال.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 text-right mb-3">حالة النشر</label>
              <div className="space-y-2">
                <label className="inline-flex items-center">
                  <input type="radio" name="isPublished" value="true" checked={formData.isPublished === true} onChange={() => setFormData((prev) => ({ ...prev, isPublished: true }))} className="form-radio h-4 w-4 text-custom-green" />
                  <span className="mr-2 text-sm sm:text-base">منشورة</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="radio" name="isPublished" value="false" checked={formData.isPublished === false} onChange={() => setFormData((prev) => ({ ...prev, isPublished: false }))} className="form-radio h-4 w-4 text-custom-green" />
                  <span className="mr-2 text-sm sm:text-base">مسودة</span>
                </label>
              </div>
            </div>
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="editorChoice"
                  checked={formData.editorChoice || false}
                  onChange={handleInputChange}
                  className="form-checkbox h-4 w-4 text-custom-green rounded"
                />
                <span className="mr-2 text-sm font-medium text-gray-700">اختيار المحرر</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 text-right mb-3">مشاركة على وسائل التواصل الاجتماعي</label>
              <div className="space-y-2">
                <label className="inline-flex items-center">
                  <input type="checkbox" name="facebook" checked={formData.facebook || false} onChange={handleInputChange} className="form-checkbox h-4 w-4 text-custom-green" />
                  <span className="mr-2 text-sm sm:text-base">فيسبوك</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="checkbox" name="twitter" checked={formData.twitter || false} onChange={handleInputChange} className="form-checkbox h-4 w-4 text-custom-green" />
                  <span className="mr-2 text-sm sm:text-base">تويتر</span>
                </label>
              </div>
            </div>
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 text-right mb-2">الصورة الرئيسية</label>
            <div className="flex justify-center px-4 sm:px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center w-full max-w-md">
                {imagePreview || currentImage ? (
                  <div className="mb-4">
                    {/* Use Next.js Image component for optimized loading */}
                    <Image 
                      src={imagePreview || currentImage || ''} 
                      alt="Preview" 
                      width={192}
                      height={128}
                      className="h-32 w-48 object-cover mb-2 rounded-md mx-auto max-w-full"
                      onError={(e) => {
                        console.error('Image load error:', e);
                        setCurrentImage(null);
                      }}
                      unoptimized={true}
                    />
                    <div className="flex flex-col sm:flex-row justify-center gap-2 mt-2">
                      <button type="button" onClick={() => { 
                        setImagePreview(null); 
                        setSelectedFile(null); 
                        setCurrentImage(null);
                        const fileInput = document.getElementById('file-upload') as HTMLInputElement; 
                        if (fileInput) fileInput.value = ''; 
                      }} className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">إزالة الصورة</button>
                      <label htmlFor="file-upload" className="px-3 py-1 bg-custom-green text-white text-sm rounded-md hover:bg-custom-green-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-green cursor-pointer">
                        {currentImage && !selectedFile ? 'تغيير الصورة' : 'اختيار صورة جديدة'}
                      </label>
                    </div>
                    {selectedFile && (<p className="text-xs text-gray-500 mt-2 break-words">{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>)}
                    {currentImage && !selectedFile && (<p className="text-xs text-gray-500 mt-2">الصورة الحالية</p>)}
                  </div>
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <div className="flex flex-col sm:flex-row text-sm text-green-600 justify-center items-center gap-1">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-custom-green hover:text-custom-green-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-custom-green"><span>رفع صورة</span></label>
                      <p>أو اسحب وأفلت</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF حتى 10MB</p>
                  </>
                )}
                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-gray-200">
            <button type="submit" disabled={isSubmitting} className={`w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-custom-green-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-green ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}>{isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}</button>
          </div>
        </form>
      </div>
        </div>
      </div>
    </div>
  );
}
