<?php
class ImageKit {
	
	private $_sourcePath;
	private $_outputPath;
	private $_dimensions;
	private $_type;
	private $_mime;
	private $_library;


	public function __construct($pathToSource=null) {
		if (!empty($pathToSource)) $this->_sourcePath = $this->checkSourcePath($pathToSource);
		$this->_library = extension_loaded("imagick") ? "imagick" : (extension_loaded("gd") ? "gd" : null);
		if (empty($this->_library)) throw new Exception("Could not find either the GD or ImageMagick extensions for ImageKit");
	}

	private function _sourceSet($throwException=true) {
		if ($throwException && empty($this->_sourcePath)) {
			throw new Exception("No source path set in ImageKit");
		}
		return !empty($this->_sourcePath);
	}

	private function _outputSet($throwException=true) {
		if ($throwException && empty($this->_outputPath)) {
			throw new Exception("No output path set in ImageKit");
		}
		return !empty($this->_outputPath);
	}

	public function setSource($pathToSource=null) {
		if (empty($pathToSource)) throw new Exception("No source path specified in ImageKit::setSource");
		$this->_sourcePath = $this->checkSourcePath($pathToSource);
		return $this;
	}

	public function setOutput($pathToOutput=null) {
		if (empty($pathToOutput)) throw new Exception("No output path specified in ImageKit::setSource");
		$this->_outputPath = $this->checkOutputPath($pathToOutput);
		return $this;	
	}

	public function checkSourcePath($pathToSource=null) {
		if (!empty($pathToSource)) $this->_sourcePath = $pathToSource;
		if ($this->_sourcePath) {	//check source path exists and is readable
			if (!file_exists($this->_sourcePath)) throw new Exception($this->_sourcePath." does not exist in ImageKit::checkSourcePath");
			if (!is_readable($this->_sourcePath)) throw new Exception($this->_sourcePath." is not readable in ImageKit::checkSourcePath");
		}
		//check this is an image and get some information at the same time
		$stats = getimagesize($this->_sourcePath);
		if (empty($stats)) { //not an image
			throw new Exception($this->_sourcePath." is not an image in ImageKit::checkSourcePath");
		} else {
			$this->setImageInfo($stats);
		}
		return $this->_sourcePath;
	}

	public function checkOutputPath($pathToOutput=null, $createPath=true) {
		if (!empty($pathToOutput)) $this->_outputPath = $pathToOutput;
		//parse the output path to remove the filename to build the path
		$path = substr($pathToOutput, 0, strrpos($pathToOutput,"/"));
		if (!file_exists($path)) {
			//try to make the path
			if (mkdir($path, 0755, true)) {
				//check the path is writable
				if (!is_writable($path)) {
					throw new Exception("Output path $path is not writable in ImageKit::checkOutputPath");
				}
			} else {
				throw new Exception("Output path $path does not exist and could not be created in ImageKit::checkOutputPath");
			}
		} else {
			//check the path is writable
			if (!is_writable($path)) {
				throw new Exception("Output path $path is not writable in ImageKit::checkOutputPath");
			}
		}
		return $pathToOutput;
	}

	/**
	* @param $imageSizeArray array expects the output of getimagesize or an array with the first and second elements being width and height respectively and the final element being the mime type
	**/
	public function setImageInfo($imageSizeArray=null) {
		$this->_sourceSet();
		if (empty($imageSizeArray)) {//no data sent, try getimagesize
			$imageSizeArray = getimagesize($this->_source);
			if (!$imageSizeArray) throw new Exception($this->_sourcePath." is not an image in ImageKit::setImageInfo");
		}
		$numImageParams = count($imageSizeArray);
		if ($numImageParams<2) {//expects at least width and height
			throw new Exception("ImageKit::setImageInfo expects an imageSizeArray parameter containing at least 2 elements, width and height, passed parameter contained $numImageParams");
		}
		$this->_dimensions = array("width"=>$imageSizeArray[0], "height"=>$imageSizeArray[1]);
		if ($numImageParams>2 || isset($imageSizeArray['mime'])) {
			if (isset($imageSizeArray['mime'])) {
				$this->_mimeType=$imageSizeArray['mime'];
			} else {
				$this->_mimeType=$imageSizeArray[$numImageParams-1];
			}
			if ($this->_mimeType) {
				$this->setImageTypeFromMime($this->_mimeType);
			}
		}
		return $this;
	}

	public function getImageInfo() {
		return array_merge($this->_dimensions, array("type"=>$this->_type, "mimetype"=>$this->_mimeType, "source"=>$this->_sourcePath, "output"=>$this->_outputPath));
	}

	public function setImageTypeFromMime($mimeType=null) {
		if (empty($mimeType)) {
			throw new Exception("ImageKit::setImageTypeFromMime requires a mime type to test");
		}
		$this->_type = substr($mimeType, strpos($mimeType, "/")+1);
		return $this->_type;
	}

	public function getLibrary() {
		return $this->_library;
	}

	public function viewSource() {
		$this->_sourceSet();
		header("Content-type: ".$this->_mimeType);
		echo file_get_contents($this->_sourcePath);
	}

	public function viewOutput() {
		if (!file_exists($this->_outputPath)) throw new Exception("Output file: ".$this->_outputPath." does not exist in ImageKit::viewOutput");
		header("Content-type: ".$this->_mimeType);
		echo file_get_contents($this->_outputPath);
	}

	public function resize($configOrPath=null, $outputPath=null, $toWidth=null, $toHeight=null, $confinement=null, $cropx1=null, $cropx2=null, $cropy1=null, $cropy2=null) {
		if (empty($configOrPath)) throw new Exception("ImageKit::resize requires either a config array or a path to a source image as the first parameter");
		if (!is_array($configOrPath)) {
			$this->setSource($configOrPath);
			//build the rest of the config array
			$config['source'] = $this->_sourcePath;
			$config['output'] = $outputPath;
			$config['width'] = $toWidth;
			$config['height'] = $toHeight;
			$config['confinement'] = $confinement;
			$config['crop']['x1'] = $cropx1;
			$config['crop']['x2'] = $cropx2;
			$config['crop']['y1'] = $cropy1;
			$config['crop']['y2'] = $cropy2;
		} else {
			$config = $configOrPath;
			//check image source path info
			if (array_key_exists("source", $config)) {//new source path set
				$this->setSource($config['source']);
			} else {
				if (!$this->_sourceSet(false)) {
					throw new Exception("No image source set in ImageKit::resizeImage");
				}
			}
			//check image output info
			if (array_key_exists("output", $config)) {//new source path set
				$this->setOutput($config['output']);
			} else {
				if (!$this->_outputSet(false)) {
					throw new Exception("No image output path set in ImageKit::resizeImage");
				}
			}
		}
		$config = $this->_buildResizeConfig($config);

		return $this->_library=="gd" ? $this->_resizeGD($config) : $this->_resizeImagick($config);
	}

	private function _buildResizeConfig($overrides=array()) {
		$this->_sourceSet();
		$config = array(
			"source"=>$this->_sourcePath,
			"output"=>$this->_outputPath,
			"sourceWidth"=>$this->_dimensions['width'],
			"sourceHeight"=>$this->_dimensions['height'],
			"outputWidth"=>$this->_dimensions['width'],
			"outputHeight"=>$this->_dimensions['height'],
			"confinement"=>"width",
			"crop"=>array("x1"=>null, "x2"=>null, "y1"=>null, "y2"=>null), 
			"library"=>$this->_library
		);
		return array_merge($config, $overrides);
	}

	public function forceLibrary($library=null) {
		if (empty($library) || !in_array($library, array("gd", "imagick"))) throw new Exception("To force ImageKit to use a library you must specify either gd or imagick");
		$this->_library = $library;
	}

	private function _resizeGD($config=null) {
		if (empty($config)) throw new Exception("No config array passed to ImageKit::_resizeGD");
		$outputDims = $this->_calculateDimensions(array("width"=>$config['sourceWidth'], "height"=>$config['sourceHeight']), array("width"=>$config['outputWidth'], "height"=>$config['outputHeight']), $config['confinement']);
		$dst_image = imagecreatetruecolor($outputDims['width'], $outputDims['height']);
		if ($this->_mimeType=="image/jpeg") {
			$src_image = imagecreatefromjpeg($config['source']);
		} else {
			$src_image = imagecreatefrompng($config['source']);
			imageAlphaBlending($src_image,false);
			imageSaveAlpha($src_image, true);

			imageAlphaBlending($dst_image,false);
			imageSaveAlpha($dst_image, true);
			$transparent = imagecolorallocatealpha($dst_image,255,255,255,127);
			imagefilledrectangle($dst_image,0,0,$outputDims['width'], $outputDims['height'],$transparent);
		} 
		//see if any crop values are set - the output dimensions will need to be calculated
		$resized = imagecopyresampled($dst_image, $src_image, 0, 0, 0, 0, $outputDims['width'], $outputDims['height'], $config['sourceWidth'], $config['sourceHeight']);
		//write the image
		$this->_mimeType=="image/jpeg" ? imagejpeg($dst_image, $config['output'], 100) : imagepng($dst_image, $config['output'], 9);
		imagedestroy($src_image);
		imagedestroy($dst_image);
		return $this;
	}

	private function _calculateDimensions($source, $output, $confinement="width") {
		$origWidth = isset($source['width']) ? $source['width'] : $source[0];
		$origHeight = isset($source['height']) ? $source['height'] : $source[1]; 
		$ratio = $origWidth/$origHeight;
		$dimensions = array("width"=>null, "height"=>null);
		switch ($confinement) {
			case "width":
				//resize to width - requires a width param in the $output
				if (!isset($output['width'])) throw new Exception("Resize to width requires an output width in ImageKit::resize");
				$dimensions['width'] = $output['width'];
				$dimensions['height'] = $output['width']*$ratio;
			break;

			case "height":
				//resize to height - requires a height param in the output
				if (!isset($output['width'])) throw new Exception("Resize to height requires an output height in ImageKit::resize");
				$dimensions['width'] = $output['height']*$ratio;
				$dimensions['height'] = $output['height'];
			break;

			case "fit":
				//resize to fit in the output dimensions - requires width and height, uses the minimum ratio of srcwidth/dstwidth, srcheigt/dstheight
				if (!isset($output['width']) || !isset($output['height'])) throw new Exception("Resize to fit requires an output width and height in ImageKit::resize");
				$scale = min($output['width']/$source['width'], $output['height']/$source['height']);
				$dimensions['width'] = $source['width']*$scale;
				$dimensions['height'] = $source['height']*$scale;
			break;

			case "stretch":
			case "fill":
				//resize to fill the output dimensions
				if (!isset($output['width']) || !isset($output['height'])) throw new Exception("Resize to fill requires an output width and height in ImageKit::resize");
				$dimensions['width'] = $output['width'];
				$dimensions['height'] = $output['height'];
			break;
			default:
				throw new Exception("$confinement is not a reize method that ImageKit can use");
		}
		return $dimensions;
	}

}
?>