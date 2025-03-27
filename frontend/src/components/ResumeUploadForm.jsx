import React, { useState, useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Loader2, Upload, ArrowRight, Check } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { setUser } from '@/redux/authSlice'
import { USER_API_END_POINT } from '@/utils/constant'

const ResumeUploadForm = () => {
  const { user } = useSelector(store => store.auth)
  const [resumeFile, setResumeFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isParsed, setIsParsed] = useState(false)
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: '',
    skills: '',
    education: '',
    experience: ''
  })
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setResumeFile(file)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleUploadAndParse = async () => {
    if (!resumeFile) {
      toast.error("Please select a resume file first")
      return
    }

    if (!resumeFile.name.endsWith('.pdf')) {
      toast.error("Only PDF files are supported")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    const formDataForUpload = new FormData()
    formDataForUpload.append('resume', resumeFile)

    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/resume/parse',
        formDataForUpload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percentCompleted)
          }
        }
      )

      if (response.data.success) {
        const parsedData = response.data.data

        setFormData(prev => ({
          ...prev,
          username: parsedData.name || prev.username,
          skills: parsedData.skills?.join(', ') || '',
          education: parsedData.education?.join('; ') || '',
          experience: parsedData.experience?.join('; ') || ''
        }))

        toast.success("Resume parsed successfully! Please review the extracted information.")
        setIsParsed(true)
      } else {
        toast.error("Resume parsing failed: " + response.data.error)
      }
    } catch (error) {
      console.error("Resume parsing error:", error)
      toast.error("Error parsing resume. Please try again or fill the form manually.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsUploading(true)
      
      const skills = formData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
      const education = formData.education.split(';').map(edu => edu.trim()).filter(Boolean)
      const experience = formData.experience.split(';').map(exp => exp.trim()).filter(Boolean)

      const payload = {
        username: formData.username,
        bio: formData.bio,
        skills,
        education,
        experience
      }

      const response = await axios.put(`${USER_API_END_POINT}/${user._id}`, payload)
      dispatch(setUser(response.data.data))
      toast.success('Profile updated successfully')
      navigate('/profile')
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const skipResumeUpload = () => {
    navigate('/profile')
  }

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Upload your resume to automatically fill your profile, or enter your details manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resume Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Resume Upload</h3>
            <p className="text-sm text-muted-foreground">
              Upload your resume (PDF) to automatically extract your skills, education, and experience.
            </p>
            
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="outline" 
                className="mb-4"
                disabled={isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {resumeFile ? 'Change Resume' : 'Select Resume'}
              </Button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
              />
              
              {resumeFile && (
                <div className="text-center">
                  <p className="text-sm font-medium">{resumeFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
              
              {resumeFile && !isParsed && (
                <Button 
                  onClick={handleUploadAndParse} 
                  className="mt-4"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    <>Parse Resume</>
                  )}
                </Button>
              )}
              
              {isParsed && (
                <div className="flex items-center mt-4 text-green-600">
                  <Check className="mr-2 h-5 w-5" />
                  <span>Resume successfully parsed!</span>
                </div>
              )}
              
              {isUploading && (
                <div className="w-full mt-4">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-center mt-1">
                    {uploadProgress}% complete
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Profile Form Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Profile Information</h3>
            <p className="text-sm text-muted-foreground">
              Review and edit your profile information below.
            </p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Full Name</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills</Label>
                  <Textarea
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="Enter skills separated by commas (e.g. JavaScript, React, Node.js)"
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate each skill with a comma
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Textarea
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    placeholder="Enter education details separated by semicolons"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate each education entry with a semicolon
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience</Label>
                  <Textarea
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="Enter work experience details separated by semicolons"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate each experience entry with a semicolon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={skipResumeUpload}>
            Skip for Now
          </Button>
          <Button onClick={handleSubmit} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save and Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ResumeUploadForm 