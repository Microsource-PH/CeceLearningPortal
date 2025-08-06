import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPHP } from "@/utils/currency";
import courseService from "@/services/courseService";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  Upload, 
  Eye, 
  Plus, 
  Trash2, 
  GripVertical,
  Play,
  FileText,
  DollarSign,
  Clock,
  Users,
  Star
} from "lucide-react";

import { CourseForEditor, Lecture } from "@/types/course";

interface CourseEditorProps {
  course?: CourseForEditor;
  onSave: (course: CourseForEditor) => void;
  onCancel: () => void;
}

export const CourseEditor = ({ course, onSave, onCancel }: CourseEditorProps) => {
  const [formData, setFormData] = useState<CourseForEditor>(course || {
    title: '',
    description: '',
    price: 0,
    duration: '',
    level: 'Beginner',
    category: '',
    status: 'draft',
    features: [],
    enrollmentType: 'one-time',
    lectures: []
  });

  const [newFeature, setNewFeature] = useState('');
  const [newLecture, setNewLecture] = useState<Lecture>({
    title: '',
    duration: '',
    type: 'video',
    order: formData.lectures.length + 1
  });

  const handleSave = () => {
    onSave(formData);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addLecture = () => {
    if (newLecture.title.trim()) {
      setFormData(prev => ({
        ...prev,
        lectures: [...prev.lectures, { ...newLecture, id: Date.now() }]
      }));
      setNewLecture({
        title: '',
        duration: '',
        type: 'video',
        order: formData.lectures.length + 2
      });
    }
  };

  const removeLecture = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lectures: prev.lectures.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{course ? 'Edit Course' : 'Create New Course'}</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Course
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter course title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Web Development">Web Development</SelectItem>
                        <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                        <SelectItem value="Computer Vision">Computer Vision</SelectItem>
                        <SelectItem value="Deep Learning">Deep Learning</SelectItem>
                        <SelectItem value="Data Science">Data Science</SelectItem>
                        <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="level">Difficulty Level</Label>
                    <Select value={formData.level} onValueChange={(value: any) => setFormData(prev => ({ ...prev, level: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="All Levels">All Levels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g., 40 hours"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter course description"
                      rows={8}
                    />
                  </div>

                  <div>
                    <Label>Course Thumbnail</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload course thumbnail</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <Label>Course Features</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature"
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  />
                  <Button onClick={addFeature} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {feature}
                      <button onClick={() => removeFeature(index)}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pricing Model</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={formData.enrollmentType === 'subscription'}
                        onCheckedChange={(checked) => setFormData(prev => ({ 
                          ...prev, 
                          enrollmentType: checked ? 'subscription' : 'one-time' 
                        }))}
                      />
                      <Label>Subscription-based course</Label>
                    </div>

                    <div>
                      <Label htmlFor="price">
                        {formData.enrollmentType === 'subscription' ? 'Monthly Price' : 'Course Price'}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₱</span>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          className="pl-10"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="originalPrice">Original Price (for discounts)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₱</span>
                        <Input
                          id="originalPrice"
                          type="number"
                          value={formData.originalPrice || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || undefined }))}
                          className="pl-10"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue Sharing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Creator Share (80%)</span>
                        <span className="font-semibold">{formatPHP(formData.price * 0.8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform Fee (20%)</span>
                        <span className="font-semibold">{formatPHP(formData.price * 0.2)}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>{formatPHP(formData.price)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6 mt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Course Content</h3>
                <Button onClick={addLecture}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lecture
                </Button>
              </div>

              {/* Add New Lecture */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add New Lecture</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      value={newLecture.title}
                      onChange={(e) => setNewLecture(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Lecture title"
                    />
                    <Select value={newLecture.type} onValueChange={(value: any) => setNewLecture(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="text">Text/Article</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={newLecture.duration}
                      onChange={(e) => setNewLecture(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="Duration (e.g., 15 min)"
                    />
                  </div>
                  <Button onClick={addLecture} className="mt-3">
                    Add Lecture
                  </Button>
                </CardContent>
              </Card>

              {/* Lectures List */}
              <div className="space-y-3">
                {formData.lectures.map((lecture, index) => (
                  <Card key={lecture.id || index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          {lecture.type === 'video' && <Play className="w-4 h-4 text-learning-blue" />}
                          {lecture.type === 'text' && <FileText className="w-4 h-4 text-learning-success" />}
                          <div>
                            <p className="font-medium">{lecture.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {lecture.type} • {lecture.duration}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeLecture(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Publishing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Course Status</Label>
                      <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Published</SelectItem>
                          <SelectItem value="inactive">Unpublished</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        {formData.status === 'draft' && 'Course is in draft mode and not visible to students.'}
                        {formData.status === 'active' && 'Course is published and available for enrollment.'}
                        {formData.status === 'inactive' && 'Course is unpublished but existing students can still access it.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Course
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};