type ViewMarkerProps = {
  view: string;
  label: string;
  desc: string;
};

export default function ViewMarker({ view, label, desc }: ViewMarkerProps) {
  return (
    <div
      data-view-marker="1"
      data-view={view}
      data-label={label}
      data-desc={desc}
      hidden
      aria-hidden="true"
    />
  );
}

