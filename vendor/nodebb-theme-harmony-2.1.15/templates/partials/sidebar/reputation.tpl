<a data-bs-toggle="dropdown" href="#" role="button" class="nav-link d-flex gap-2 justify-content-between align-items-center position-relative" component="reputation/dropdown" aria-haspopup="true" aria-expanded="false" aria-label="Reputation">
	<span class="d-flex gap-2 align-items-center text-nowrap truncate-open">
		<span class="position-relative">
			<i component="reputation/icon" class="fa fa-fw fa-trophy"></i>
		</span>
		<span class="nav-text small visible-open fw-semibold">Reputation</span>
	</span>
</a>
<ul class="reputation-dropdown dropdown-menu p-1 shadow" role="menu" style="min-width: 350px; max-width: 400px;">
	<li>
		<div component="reputation/content" class="p-3">
			<h6 class="fw-bold mb-3">Reputation</h6>
			<div class="mb-3">
				<div class="d-flex justify-content-between align-items-center">
					<span class="text-muted">Days Active:</span>
					<span class="fw-semibold" component="reputation/days-active">{user.reputation}</span>
				</div>
			</div>
			<div>
				<h6 class="fw-semibold mb-2">Streaks</h6>
				<div class="mb-2">
					<div class="d-flex justify-content-between align-items-center">
						<span class="text-muted text-sm">Current Streak:</span>
						<span class="fw-semibold" component="reputation/current-streak">{user.streak}</span>
					</div>
				</div>
				<div component="reputation/heatmap" class="mt-3">
					<!-- Heatmap will be inserted here -->
					<div class="text-center text-muted">
						<div class="spinner-border spinner-border-sm" role="status">
							<span class="visually-hidden">Loading...</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</li>
</ul>

