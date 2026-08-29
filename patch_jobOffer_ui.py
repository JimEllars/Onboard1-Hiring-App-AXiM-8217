import re

with open('src/pages/JobOffer.jsx', 'r') as f:
    content = f.read()


old_certificate = """            <div className="border-t pt-8 mt-8">
              <h2 className="text-xl font-bold mb-4">Execution & Audit Certificate</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-bold text-gray-600">Electronic Signature:</p>
                  <p className="font-serif italic text-lg">{signature}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-600">Timestamp:</p>
                  <p>{new Date().toISOString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-bold text-gray-600">Cryptographic Verification Token (SHA-256):</p>
                  <p className="font-mono text-xs break-all bg-gray-50 p-2 rounded">{auditHash}</p>
                </div>
              </div>
            </div>"""


new_certificate = """            <div className="border-t pt-8 mt-8">
              <h2 className="text-xl font-bold mb-4">AXiM Cryptographic Execution Certificate</h2>
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-inner">
                <div>
                  <p className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-1">Electronic Signature</p>
                  <p className="font-serif italic text-lg text-gray-900">{signature}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-1">Document Classification</p>
                  <p className="font-mono text-sm text-gray-900">{docType} Agreement</p>
                </div>
                <div>
                  <p className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-1">Execution Timestamp</p>
                  <p className="font-mono text-sm text-gray-900">{new Date().toISOString()}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-1">Verified IP Address</p>
                  <p className="font-mono text-sm text-gray-900">192.168.1.1</p>
                </div>
                <div className="col-span-2 mt-4 pt-4 border-t border-gray-200">
                  <p className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-1">Cryptographic Verification Token (SHA-256)</p>
                  <p className="font-mono text-xs break-all text-gray-800 bg-white p-3 rounded border border-gray-200">{auditHash}</p>
                </div>
              </div>
            </div>"""

content = content.replace(old_certificate, new_certificate)

with open('src/pages/JobOffer.jsx', 'w') as f:
    f.write(content)
