import React, { useState, useRef } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'
import { Loader2, Upload } from 'lucide-react'
import { Progress } from './ui/progress'

const UpdateProfileDialog = ({ open, setOpen }) => {
  const { user } = useSelector(store => store.auth)
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    education: user?.education?.join('; ') || '',
    experience: user?.experience?.join('; ') || '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)
  const [isParsingResume, setIsParsingResume] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)
  
  const dispatch = useDispatch()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setResumeFile(file)
      
      // Automatically parse resume when file is selected
      handleParseResume(file)
    }
  }
  
  const handleParseResume = async (file) => {
    if (!file) {
      toast.error("Please select a resume file first")
      return
    }
    
    // Validate file type (PDF only for now)
    if (!file.name.endsWith('.pdf')) {
      toast.error("Only PDF files are supported")
      return
    }
    
    setIsParsingResume(true)
    setUploadProgress(0)
    
    const formDataForUpload = new FormData()
    formDataForUpload.append('resume', file)
    
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
        
        // Update form with parsed data
        setFormData(prevData => ({
          ...prevData,
          username: parsedData.name || prevData.username,
          skills: parsedData.skills?.join(', ') || prevData.skills,
          education: parsedData.education?.join('; ') || prevData.education,
          experience: parsedData.experience?.join('; ') || prevData.experience,
        }))
        
        toast.success("Resume parsed successfully! Form has been updated.")
      } else {
        toast.error("Resume parsing failed: " + response.data.error)
      }
    } catch (error) {
      console.error("Resume parsing error:", error)
      toast.error("Error parsing resume. Please try again or fill the form manually.")
    } finally {
      setIsParsingResume(false)
      setUploadProgress(0)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
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
      setOpen(false)
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Update Profile</AlertDialogTitle>
          <AlertDialogDescription>
            Make changes to your profile details here. Click save when you're done.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-4 py-4">
          {/* Resume Upload Section */}
          <div className="border-b pb-4 mb-4">
            <Label className="font-medium mb-2 block">Upload Resume for Auto-Fill</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Upload your resume (PDF) to automatically fill the form fields below.
            </p>
            
            <div className="flex items-center gap-2 mb-2">
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="outline" 
                className="gap-2"
                disabled={isParsingResume}
              >
                <Upload size={16} />
                {resumeFile ? 'Change Resume' : 'Upload Resume'}
              </Button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
              />
              
              {resumeFile && (
                <span className="text-sm text-muted-foreground">
                  {resumeFile.name}
                </span>
              )}
            </div>
            
            {isParsingResume && (
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Parsing resume...</span>
                </div>
                <Progress value={uploadProgress} className="mt-1" />
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-2">
              Note: You can still manually edit all fields after auto-fill.
            </p>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Name
            </Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bio" className="text-right">
              Bio
            </Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="skills" className="text-right">
              Skills
            </Label>
            <Textarea
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Separate skills with commas"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="education" className="text-right">
              Education
            </Label>
            <Textarea
              id="education"
              name="education"
              value={formData.education}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Separate education entries with semicolons"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="experience" className="text-right">
              Experience
            </Label>
            <Textarea
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Separate experience entries with semicolons"
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              'Save changes'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default UpdateProfileDialog