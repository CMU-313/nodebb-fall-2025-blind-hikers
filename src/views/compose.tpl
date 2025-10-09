<div class="container">
	<div class="row">
		<div class="col-lg-8 offset-lg-2">
			<div class="card">
				<div class="card-header">
					<h4 class="mb-0">[[modules:composer.compose]]</h4>
				</div>
				<div class="card-body">
					<form method="post" action="{config.relative_path}/compose">
						<input type="hidden" name="_csrf" value="{config.csrf_token}" />
						
						<!-- Category Selection -->
						<div class="mb-3">
							<label class="form-label" for="category-select"><strong>[[category:category]]</strong></label>
							<select name="cid" id="category-select" class="form-select" required>
								<option value="">[[category:select-category]]</option>
								{{{ each categories }}}
								<option value="{categories.cid}" {{{ if categories.selected }}}selected{{{ end }}}>
									{categories.level}{categories.name}
								</option>
								{{{ end }}}
							</select>
						</div>

						<!-- Topic Title -->
						<div class="mb-3">
							<label class="form-label" for="topic-title"><strong>[[topic:title]]</strong></label>
							<input type="text" name="title" id="topic-title" class="form-control" placeholder="[[topic:composer.title-placeholder]]" required />
						</div>

						<!-- Content -->
						<div class="mb-3">
							<label class="form-label" for="topic-content"><strong>[[topic:content]]</strong></label>
							<textarea name="content" id="topic-content" rows="10" class="form-control" placeholder="[[modules:composer.textarea.placeholder]]" required></textarea>
						</div>

						<!-- Anonymous Option -->
						<div class="mb-3">
							<div class="form-check">
								<input type="checkbox" name="anonymous" id="compose-anonymous" class="form-check-input" />
								<label class="form-check-label" for="compose-anonymous">
									[[topic:Anonymous]]
								</label>
							</div>
						</div>

						<!-- Submit Button -->
						<div class="d-flex justify-content-end gap-2">
							<a href="{config.relative_path}/" class="btn btn-secondary">[[global:buttons.cancel]]</a>
							<button type="submit" class="btn btn-primary">[[topic:composer.submit]]</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
</div>
