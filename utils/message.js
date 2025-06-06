
module.exports = {
	BadRequest: {
		error: 'Bad Request',
		status: 400,
	},

	Unauthorized: {
		error: 'Unauthorised',
		status: 401,
	},

	Forbidden: {
		error: 'Forbidden',
		status: 403,
	},

	NotFound: {
		error: 'Not Found',
		status: 404,
	},

	UnprocessableEntity: {
		status: 422,
		error: 'Unprocessable Entity',
	},

	InternalServerError: {
		error: 'Internal Server Error',
		status: 500,
	},

	Success: {
		error: '',
		status: 200,
	},

	onlyAdmin: Object.assign({}, this.Forbidden, {
		message: 'Only admins are allowed to do this!',
	}),

	NoPermesssion: Object.assign({}, {
		error: 'Forbidden',
		status: 403,
		message: 'You do not have permission to consume this resource!',
	}),

	invalidId: Object.assign({}, this.BadRequest, {
		message: 'Invalid Id parameter',
	}),

	invalidSearchTerm: Object.assign({}, this.BadRequest, {
		message: 'Invalid search term',
	}),

	missingAttr(attrs) {
		return Object.assign({}, this.BadRequest, {
			message: `Attribute(s) (${attrs.join(',')}) seem(s) to be missing`,
		});
	},

	unwantedAttr(attrs) {
		return Object.assign({}, this.BadRequest, {
			message: `Attribute(s) (${attrs.join(',')}) can't be updated`,
		});
	},

	uniqueAttr(attrs) {
		return Object.assign({}, this.BadRequest, {
			message: `Attribute(s) [${attrs.join(',')}] must be unique`,
		});
	},

	custom(msg) {
		return Object.assign({}, this.BadRequest, {
			message: msg,
		});
	},

	// REST

	addFailure() {
		return Object.assign({}, this.BadRequest, {
			message: 'WAS NOT added',
		});
	},

	deleteFailure() {
		return Object.assign({}, this.BadRequest, {
			message: 'WAS NOT deleted',
		});
	},

	updateFailure() {
		return Object.assign({}, this.BadRequest, {
			message: 'WAS NOT updated',
		});
	},

	addSuccess() {
		return Object.assign({}, this.Success, {
			message: 'Added successfully',
		});
	},

	deleteSuccess() {
		return Object.assign({}, this.Success, {
			message: 'Deleted successfully',
		});
	},

	updateSuccess() {
		return Object.assign({}, this.Success, {
			message: 'Updated successfully',
		});
	},

	empty: [],
	success: 'Success',
	error: 'Error',
	message: 'Message',
};