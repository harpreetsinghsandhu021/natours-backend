const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/apiFeatures");

exports.getAll = (model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let filter = {};

    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new ApiFeatures(model.find(filter), req.query)
      .filter()
      .sort()
      .limit()
      .paginate();

    const allDocs = await model.find();

    if (popOptions) features.query.populate(popOptions);

    const docs = await features.query;

    res.status(200).json({
      status: "success",
      count: allDocs.length,
      results: docs.length,
      docs,
    });
  });

exports.getOne = (model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const query = model.findById(req.params.id);
    if (popOptions) query.populate(popOptions);

    const docs = await query;

    res.status(200).json({
      status: "success",
      docs,
    });
  });

exports.createOne = (model) =>
  catchAsync(async (req, res, next) => {
    const docs = await model.create(req.body);

    res.status(201).json({
      status: "success",
      docs,
    });
  });

exports.updateOne = (model) =>
  catchAsync(async (req, res, next) => {
    console.log(req.body);

    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) return next(new Error("no document found with that ID", 404));

    res.status(200).json({
      status: "success",
      doc,
    });
  });
exports.deleteOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new Error("no document found with that ID", 404));

    res.status(204).json({
      status: "success",
      data: null,
    });
  });
