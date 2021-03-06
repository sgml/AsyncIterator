/**
 * Batch processes large datasets with the help of requestAnimationFrame in order
 * to not lock up the single thread.
 */
var asyncIterator = (function($) {
	/**
	 * Runs a callback on a large dataset without holding up the main thread.
	 *
	 * @param {array}		arr 		The dataset
	 * @param {function}	cb 			The callback function
	 * @param {int}			batchSize	(Optional) the number of operations per call, default: 10
	 */
	var AsyncIterator = function(arr, cb, batchSize) {
		this.arr = arr;
		this.cb = cb;
		this.batchSize = parseInt(batchSize) || 10;
		this.position = 0;
		this.results = [];

		this._deferred;
	}

	/**
	 * Starts the iteration of the dataset
	 *
	 * @return {Jquery deferred}	A promise that will resolve when operations are done.
	 */
	AsyncIterator.prototype.process = function() {
		this._deferred = new $.Deferred();

		this._iterate();

		return this._deferred;
	}

	/**
	 * The actual operating part
	 * @private
	 */
	AsyncIterator.prototype._iterate = function() {
		for(var i = 0; i  < this.batchSize; i++) {
			if(this.position >= this.arr.length) { break; }

			var currentItem = this.arr[this.position];

			this.results[this.position] = this.cb(currentItem, this.position);

			this.position++;
		}

		if(this.position < this.arr.length) {
			window.requestAnimationFrame(this._iterate.bind(this));
		} else {
			this._deferred.resolve(this.results);
		}
	}

	/**
	 * The public method for creating the AsyncIterator
	 *
	 * @return {Jquery deferred}	A promise that will resolve when operations are done.
	 */
	return function(arr, cb, size) {
		var it = new AsyncIterator(arr, cb, size);
		return it.process();
	}
})(jQuery);
