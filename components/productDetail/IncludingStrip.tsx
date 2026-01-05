"use client";

type Item = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};

/* ===== Icons (SVG inline) ===== */
function SparklesSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 25"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        d="m11.5 10.97 3.47-3.47m3.06 10 3.47-3.47m-9.18 2.65L20.4 8.6m6.45 12.12c2.9-3.09 3.98-7.58 3.4-11.7-.53-3.58-3.67-5.65-6.84-6.73C17.4.1 5.36.4 2.4 5.7-.68 11.34 5.31 25 16.51 25c4.08-.03 6.6-1.1 9-3.03l-.42.3c.63-.47 1.24-.97 1.76-1.55Z"
      />
    </svg>
  );
}

function BadgeCheckSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 15 15"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinejoin="round"
        d="M3.5 2.27H2a1 1 0 0 0-1 1V14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3.27a1 1 0 0 0-1-1h-1.5m-2.5 0H6M4 4h1.5a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5H4a.5.5 0 0 0-.5.5v2c0 .28.22.5.5.5Zm6.5 0H12a.5.5 0 0 0 .5-.5v-2A.5.5 0 0 0 12 1h-1.5a.5.5 0 0 0-.5.5v2c0 .28.22.5.5.5Z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m10.57 7.2-3.22 3.84-1.91-1.61"
      />
    </svg>
  );
}

function BriefcaseSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 35 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path d="M4.37 15.327a2.87 2.87 0 0 1-2.869-2.87V5.805A4.305 4.305 0 0 1 5.805 1.5h24.39a4.304 4.304 0 0 1 4.303 4.305v6.653a2.87 2.87 0 0 1-2.869 2.869m-27.258 0H2.936c-.792 0-1.435.642-1.435 1.434v1.435A4.304 4.304 0 0 0 5.805 22.5h24.39a4.304 4.304 0 0 0 4.303-4.304v-1.435c0-.792-.642-1.434-1.434-1.434h-1.435m-27.258 0h2.483m24.775 0h-2.483m-12.99-4.749-.001.035c-.01.784-.208 1.61-.513 2.402-.399 1.034-.918 1.78-1.529 2.312m2.042-4.749a1.845 1.845 0 0 1 3.689 0m-3.689 0c.012-2.104-1.341-3.895-5.626-3.859-2.662.024-5.38.072-5.44 4.007-.032 2.116.704 3.642 1.765 4.6m12.99-4.748v.035c.01.784.207 1.61.512 2.402.399 1.034.918 1.78 1.53 2.312m-2.042-4.749c-.012-2.104 1.342-3.895 5.628-3.859 2.662.024 5.378.072 5.439 4.007.032 2.116-.705 3.642-1.765 4.6m-22.292 0h7.26m0 0h7.771m0 0h7.26" />
    </svg>
  );
}

/* ===== UI ===== */
function Divider() {
  return <span className="hidden sm:block h-6 w-px bg-gray-300" />;
}

function IncludingItem({ icon: Icon, label }: Item) {
    const isBriefcase = label === "Case & cleaning cloth";
  return (
    <span className="inline-flex items-center gap-2 text-gray-700">
        <Icon className={isBriefcase ? "w-7 h-7 text-gray-700" : "w-6 h-6 text-gray-700"} />
    <span className="text-gray-700 font-medium">{label}</span>
    </span>
  );
}

export default function IncludingStrip() {
  const items: Item[] = [
    { icon: SparklesSvg,   label: "Lớp phủ chống trầy" },
    { icon: BadgeCheckSvg, label: "Bảo hành 365 ngày" },
    { icon: BriefcaseSvg,  label: "Hộp và khăn lau" },
  ];

  return (
    <div className="rounded-full bg-blue-50/60 py-4 flex justify-center items-center">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="font-bold text-blue-700 text-lg">Bao gồm:</span>

        <IncludingItem {...items[0]} />
        <Divider />
        <IncludingItem {...items[1]} />
        <Divider />
        <IncludingItem {...items[2]} />
      </div>
    </div>
  );
}