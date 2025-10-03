'use strict';

define('forum/topic/emojiTooltips', [], function () {
	const EmojiTooltips = {};

	EmojiTooltips.init = function () {
		// Remove any existing tooltip handlers
		EmojiTooltips.destroy();
		
		// Add tooltip functionality to all reaction buttons
		$('[component="post/reaction"][data-tooltip]').each(function () {
			const $button = $(this);
			const tooltipText = $button.attr('data-tooltip');
			
			// Create tooltip element
			const $tooltip = $('<div class="emoji-tooltip">' + tooltipText + '</div>');
			$button.append($tooltip);
			
			// Add hover events
			$button.on('mouseenter.emojiTooltip', function () {
				$tooltip.addClass('show');
			});
			
			$button.on('mouseleave.emojiTooltip', function () {
				$tooltip.removeClass('show');
			});
		});
	};

	EmojiTooltips.destroy = function () {
		// Remove all tooltip event handlers and elements
		$('[component="post/reaction"]').off('.emojiTooltip');
		$('.emoji-tooltip').remove();
	};

	EmojiTooltips.refresh = function () {
		// Re-initialize tooltips (useful after dynamic content changes)
		EmojiTooltips.init();
	};

	return EmojiTooltips;
});
