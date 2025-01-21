import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import CategoryPage from './pages/tools/CategoryPage';
import Watermark from './pages/tools/image/Watermark';
import Editor from './pages/tools/image/Editor';
import Grid from './pages/tools/image/Grid';
import Merge from './pages/tools/image/Merge';
import Grayscale from './pages/tools/image/Grayscale';
import Sketch from './pages/tools/image/Sketch';
import OCR from './pages/tools/image/OCR';
import ImageCompress from './pages/tools/image/Compress';
import Resize from './pages/tools/image/Resize';
import GifSplit from './pages/tools/image/GifSplit';
import GifCreate from './pages/tools/image/GifCreate';
import Convert from './pages/tools/image/Convert';
import { PDFToImage } from './pages/tools/document/PDFToImage';
import ImageToPDF from './pages/tools/document/ImageToPDF';
import { WordToPDF } from './pages/tools/document/WordToPDF';
import TextCompare from './pages/tools/text/TextCompare';
import TextFormat from './pages/tools/text/TextFormat';
import MD5 from './pages/tools/development/MD5';
import JSONFormat from './pages/tools/development/JSONFormat';
import Base64 from './pages/tools/development/Base64';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools/:category" element={<CategoryPage />} />
          <Route path="/tools/image/editor" element={<Editor />} />
          <Route path="/tools/image/watermark" element={<Watermark />} />
          <Route path="/tools/image/grid" element={<Grid />} />
          <Route path="/tools/image/merge" element={<Merge />} />
          <Route path="/tools/image/grayscale" element={<Grayscale />} />
          <Route path="/tools/image/sketch" element={<Sketch />} />
          <Route path="/tools/image/ocr" element={<OCR />} />
          <Route path="/tools/image/compress" element={<ImageCompress />} />
          <Route path="/tools/image/resize" element={<Resize />} />
          <Route path="/tools/image/gif-split" element={<GifSplit />} />
          <Route path="/tools/image/gif-create" element={<GifCreate />} />
          <Route path="/tools/image/convert" element={<Convert />} />
          <Route path="/tools/document/pdf-to-image" element={<PDFToImage />} />
          <Route path="/tools/document/image-to-pdf" element={<ImageToPDF />} />
          <Route path="/tools/document/word-to-pdf" element={<WordToPDF />} />
          <Route path="/tools/text/compare" element={<TextCompare />} />
          <Route path="/tools/text/format" element={<TextFormat />} />
          <Route path="/tools/development/md5" element={<MD5 />} />
          <Route path="/tools/development/json-format" element={<JSONFormat />} />
          <Route path="/tools/development/base64" element={<Base64 />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;