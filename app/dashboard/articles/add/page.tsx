"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createArticle, getCategories, getTags, getPodcastTypes, getUpperArticles, getArticles } from "../lib/api";
import { ArticleCreate } from "../types/Article";
import { CategoryAll } from "../types/Category";
import { Tag } from "../types/Tag";
import { PodcastType } from "../types/PodcastType";
import { UpperArticle as UpperArticleBase } from "../types/UpperArticle";

// Extend UpperArticle to include assignedArticleTitle and isAvailable for local use
type UpperArticle = UpperArticleBase & {
  assignedArticleTitle?: string | null;
  isAvailable?: boolean;
};
import { toast } from "react-hot-toast";
import Image from "next/image";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default function AddArticle() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryAll[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [podcastTypes, setPodcastTypes] = useState<PodcastType[]>([]);
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
    podcastTypeId: undefined,
    upperArticleId: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch categories, tags, podcast types, and upper articles when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [categoriesResponse, tagsResponse, podcastTypesResponse, allUpperArticlesResponse, allArticlesResponse] = await Promise.all([
          getCategories(),
          getTags(),
          getPodcastTypes(),
          getUpperArticles(),
          getArticles() // Get all articles to show current assignments
        ]);
        
        // Enrich UpperArticles with current assignment information
        const upperArticlesWithAssignments = allUpperArticlesResponse.map(upperArticle => {
          const assignedArticle = allArticlesResponse.find(article => 
            article.upperArticleId === upperArticle.upperArticleId
          );
          return {
            ...upperArticle,
            assignedArticleTitle: assignedArticle ? assignedArticle.articleTitle : null,
            isAvailable: !assignedArticle
          };
        });
        
        const upperArticlesResponse = upperArticlesWithAssignments;
        
        if (Array.isArray(categoriesResponse)) {
          setCategories(categoriesResponse);
        }
        if (Array.isArray(tagsResponse)) {
          setTags(tagsResponse);
        }
        if (Array.isArray(podcastTypesResponse)) {
          setPodcastTypes(podcastTypesResponse);
        }
        if (Array.isArray(upperArticlesResponse)) {
          setUpperArticles(upperArticlesResponse);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("فشل في تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    } else if (name === "tagId" || name === "podcastTypeId" || name === "upperArticleId") {
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
      
      console.log('File selected:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
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
      console.log('File set in state:', file.name);

      // Create image preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
        console.log('Image preview created');
      };
      reader.readAsDataURL(file);

      // Clear any previous file upload errors
      if (errors.imageFile) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.imageFile;
          return newErrors;
        });
      }
    }
  };

  const handleEditorChange = (event: unknown, editor: unknown) => {
    const editorInstance = editor as { getData: () => string };
    const data = editorInstance.getData();
    setFormData((prev) => ({
      ...prev,
      articleContent: data,
    }));

    // Clear error when field is edited
    if (errors.articleContent) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.articleContent;
        return newErrors;
      });
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
      console.log('Submitting article with:', {
        title: formData.articleTitle,
        summary: formData.articleSummary,
        content: formData.articleContent,
        categoryId: formData.categoryId.id,
        hasSelectedFile: !!selectedFile,
        selectedFileName: selectedFile?.name,
        selectedFileSize: selectedFile?.size
      });

      // Prepare form data with current date and publish status
      const articleData: ArticleCreate = {
        ...formData,
        // Handle upperArticleId properly - only send if it has a valid value
        upperArticleId: formData.upperArticleId && formData.upperArticleId > 0 
          ? formData.upperArticleId 
          : undefined,
        isPublished: true,
        createdDate: new Date()
      };

      console.log('Article data prepared:', {
        ...articleData,
        upperArticleId: articleData.upperArticleId,
        upperArticleIdType: typeof articleData.upperArticleId,
        originalFormUpperArticleId: formData.upperArticleId,
        originalFormUpperArticleIdType: typeof formData.upperArticleId
      });

      // Call API with article data and selected file
      const result = await createArticle(articleData, selectedFile || undefined);

      console.log('Article created successfully:', result);

      toast.success(`تم إنشاء المقال بنجاح${result.imagePath ? ' مع الصورة' : ''}`, {
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
        router.push("/dashboard/articles");
      }, 1500);
    } catch (error) {
      console.error("Error creating article:", error);
      
      // Check if it's an upper article conflict error
      let errorMessage = "فشل في إنشاء المقال";
      if (error instanceof Error && error.message.includes("already linked")) {
        errorMessage = "المقال العلوي المحدد مربوط بالفعل بمقال آخر. يرجى اختيار مقال علوي آخر أو إنشاء جديد.";
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
          إضافة مقال جديد
        </h1>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="articleTitle"
              className="block text-sm font-medium text-gray-700 text-right"
            >
              عنوان المقال
            </label>
            <input
              type="text"
              id="articleTitle"
              name="articleTitle"
              value={formData.articleTitle}
              onChange={handleInputChange}
              className={`mt-1 block w-full border ${
                errors.articleTitle ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right text-black`}
            />
            {errors.articleTitle && (
              <p className="mt-1 text-sm text-red-600 text-right">
                {errors.articleTitle}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="articleSummary"
              className="block text-sm font-medium text-gray-700 text-right"
            >
              ملخص المقال
            </label>
            <textarea
              id="articleSummary"
              name="articleSummary"
              rows={3}
              value={formData.articleSummary}
              onChange={handleInputChange}
              className={`mt-1 block w-full border ${
                errors.articleSummary ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right text-black`}
            />
            {errors.articleSummary && (
              <p className="mt-1 text-sm text-red-600 text-right">
                {errors.articleSummary}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="articleContent"
              className="block text-sm font-medium text-gray-700 text-right"
            >
              محتوى المقال
            </label>            <div className={`mt-1 ${errors.articleContent ? 'border-2 border-red-500 rounded-md' : ''}`}>
              <CKEditor
                editor={ClassicEditor}
                data={formData.articleContent}
                onChange={handleEditorChange}
                config={{
                  language: 'ar',
                  removePlugins: ['Title'],
                  toolbar: [
                    'heading',
                    '|',
                    'bold',
                    'italic',
                    'link',
                    'bulletedList',
                    'numberedList',
                    '|',
                    'indent',
                    'outdent',
                    '|',
                    'blockQuote',
                    'insertTable',
                    'undo',
                    'redo'
                  ]
                }}
              />
            </div>
            {errors.articleContent && (
              <p className="mt-1 text-sm text-red-600 text-right">
                {errors.articleContent}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="categoryId"
              className="block text-sm font-medium text-gray-700 text-right"
            >
              التصنيف
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId.id || ""}
              onChange={handleInputChange}
              className={`mt-1 block w-full border ${
                errors.categoryId ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right text-black`}
              disabled={loading}
            >
              <option value="">اختر تصنيف</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600 text-right">
                {errors.categoryId}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="tagId"
              className="block text-sm font-medium text-gray-700 text-right"
            >
              الوسم
            </label>
            <select
              id="tagId"
              name="tagId"
              value={formData.tagId || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right text-black"
              disabled={loading}
            >
              <option value="">اختر وسم</option>
              {tags.map((tag) => (
                <option key={tag.tagId} value={tag.tagId}>
                  {tag.tagName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="podcastTypeId"
              className="block text-sm font-medium text-gray-700 text-right"
            >
              نوع البودكاست
            </label>
            <select
              id="podcastTypeId"
              name="podcastTypeId"
              value={formData.podcastTypeId || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right text-black"
              disabled={loading}
            >
              <option value="">اختر نوع البودكاست</option>
              {podcastTypes.map((podcastType) => (
                <option key={podcastType.podcastId} value={podcastType.podcastId}>
                  {podcastType.podcastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="upperArticleId"
              className="block text-sm font-medium text-gray-700 text-right"
            >
              المقال العلوي
              <span className="text-xs text-gray-500 block mt-1">
                (يمكن إعادة تعيين المقالات العلوية المستخدمة)
              </span>
            </label>
            <select
              id="upperArticleId"
              name="upperArticleId"
              value={formData.upperArticleId || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right text-black"
              disabled={loading}
            >
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

          <div>
            <label className="block text-sm font-medium text-gray-700 text-right mb-3">
              الحالة
            </label>
            <div className="space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="isPublished"
                  value="true"
                  checked={formData.isPublished === true}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isPublished: true,
                    }))
                  }
                  className="form-radio h-4 w-4 text-custom-green"
                />
                <span className="mr-2">منشورة</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="isPublished"
                  value="false"
                  checked={formData.isPublished === false}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isPublished: false,
                    }))
                  }
                  className="form-radio h-4 w-4 text-custom-green"
                />
                <span className="mr-2">مسودة</span>
              </label>
            </div>
          </div>

          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="editorChoice"
                checked={formData.editorChoice || false}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    editorChoice: e.target.checked,
                  }))
                }
                className="form-checkbox h-4 w-4 text-custom-green rounded"
              />
              <span className="mr-2 text-sm font-medium text-gray-700">اختيار المحرر</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 text-right mb-3">
              مشاركة على وسائل التواصل الاجتماعي
            </label>
            <div className="space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="facebook"
                  checked={formData.facebook || false}
                  onChange={handleInputChange}
                  className="form-checkbox h-4 w-4 text-custom-green"
                />
                <span className="mr-2">فيسبوك</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="twitter"
                  checked={formData.twitter || false}
                  onChange={handleInputChange}
                  className="form-checkbox h-4 w-4 text-custom-green"
                />
                <span className="mr-2">تويتر</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 text-right">
              الصورة الرئيسية
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="mb-4">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={200}
                      height={150}
                      className="h-32 w-48 object-cover mb-2 rounded-md mx-auto"
                    />
                    <div className="flex justify-center space-x-2 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setSelectedFile(null);
                          // Reset file input
                          const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                          if (fileInput) fileInput.value = '';
                        }}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        إزالة الصورة
                      </button>
                      <label
                        htmlFor="file-upload"
                        className="px-3 py-1 bg-custom-green text-white text-sm rounded-md hover:bg-custom-green-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-green cursor-pointer"
                      >
                        تغيير الصورة
                      </label>
                    </div>
                    {selectedFile && (
                      <p className="text-xs text-gray-500 mt-2">
                        {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-green-600 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-custom-green hover:text-custom-green-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-custom-green"
                      >
                        <span>رفع صورة</span>
                      </label>
                      <p className="pr-1">أو اسحب وأفلت</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF حتى 10MB
                    </p>
                  </>
                )}
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-custom-green-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-green ${
                isSubmitting ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "جاري الإضافة..." : "إضافة المقال"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
