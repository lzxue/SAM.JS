// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

import { Tensor } from 'onnxruntime-web';
var modelData = function modelData(_ref) {
  var clicks = _ref.clicks,
    tensor = _ref.tensor,
    modelScale = _ref.modelScale;
  var imageEmbedding = tensor;
  var pointCoords;
  var pointLabels;
  var pointCoordsTensor;
  var pointLabelsTensor;

  // Check there are input click prompts
  if (clicks) {
    var n = clicks.length;

    // If there is no box input, a single padding point with
    // label -1 and coordinates (0.0, 0.0) should be concatenated
    // so initialize the array to support (n + 1) points.
    pointCoords = new Float32Array(2 * (n + 1));
    pointLabels = new Float32Array(n + 1);

    // Add clicks and scale to what SAM expects
    for (var i = 0; i < n; i++) {
      pointCoords[2 * i] = clicks[i].x * modelScale.samScale;
      pointCoords[2 * i + 1] = clicks[i].y * modelScale.samScale;
      pointLabels[i] = clicks[i].clickType;
    }

    // Add in the extra point/label when only clicks and no box
    // The extra point is at (0, 0) with label -1
    pointCoords[2 * n] = 0.0;
    pointCoords[2 * n + 1] = 0.0;
    pointLabels[n] = -1.0;

    // Create the tensor
    pointCoordsTensor = new Tensor('float32', pointCoords, [1, n + 1, 2]);
    pointLabelsTensor = new Tensor('float32', pointLabels, [1, n + 1]);
  }
  var imageSizeTensor = new Tensor('float32', [modelScale.height, modelScale.width]);
  if (pointCoordsTensor === undefined || pointLabelsTensor === undefined) return;

  // There is no previous mask, so default to an empty tensor
  var maskInput = new Tensor('float32', new Float32Array(256 * 256), [1, 1, 256, 256]);
  // There is no previous mask, so default to 0
  var hasMaskInput = new Tensor('float32', [0]);
  return {
    image_embeddings: imageEmbedding,
    point_coords: pointCoordsTensor,
    point_labels: pointLabelsTensor,
    orig_im_size: imageSizeTensor,
    mask_input: maskInput,
    has_mask_input: hasMaskInput
  };
};
export { modelData };