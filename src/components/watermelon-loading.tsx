export function WatermelonLoadingContent() {
  return (
    <div className="watermelon-loading-content">
      <div className="watermelon-loading-mark" aria-hidden="true">
        <span />
      </div>
      <div>
        <div className="watermelon-loading-title">KiTa App</div>
        <div className="watermelon-loading-copy">Animation wird geladen</div>
      </div>
    </div>
  )
}

export function WatermelonLoadingScreen() {
  return (
    <div className="watermelon-splash is-loading" aria-label="KiTa Intro wird geladen">
      <WatermelonLoadingContent />
    </div>
  )
}
