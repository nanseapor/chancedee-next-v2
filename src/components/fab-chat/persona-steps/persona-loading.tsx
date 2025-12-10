export function PersonaLoading() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-primary-50/90 to-primary-100/80 dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 backdrop-blur-sm flex flex-col items-center justify-center z-10">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin shadow-lg" />
        <div
          className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-r-primary-400 animate-spin opacity-60"
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        />
        <div className="absolute inset-2 w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/10 to-primary-600/20 blur-sm" />
      </div>
      <div className="text-center max-w-lg px-6">
        <div className="font-bold text-2xl mb-4 text-primary-800 dark:text-primary-200 tracking-tight">
          กำลังเตรียมข้อมูล
        </div>
        <div className="text-base text-primary-700 dark:text-primary-400 leading-relaxed mb-6 font-medium">
          กรุณารอสักครู่...
        </div>
      </div>
    </div>
  );
}
